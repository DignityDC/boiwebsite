require('dotenv').config();
require('child_process').execSync('node deploy-commands.js', { stdio: 'inherit' });
const {
  Client, GatewayIntentBits, Partials,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder,
  ContainerBuilder, TextDisplayBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize,
  Events, MessageFlags
} = require('discord.js');

const {
  ROLES, HIERARCHY, ROLE_NAMES, CHANNELS,
  getHighestRankIndex, getHighestRole,
  outranks, hasOverride, hasAtLeast
} = require('./config');

const db = require('./db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

// Helper: build the Components V2 training container
function buildTrainingContainer(msgId, timestamp, attending, instructing, cancelled = false) {
  const attendList   = attending.size   > 0 ? [...attending].map(id => `<@${id}>`).join('\n')   : '*No one yet*';
  const instructList = instructing.size > 0 ? [...instructing].map(id => `<@${id}>`).join('\n') : '*No one yet*';

  if (cancelled) {
    return new ContainerBuilder()
      .setAccentColor(0x99aab5)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## BOI Training Session — CANCELLED')
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`This training session scheduled for <t:${timestamp}:F> has been cancelled.`)
      );
  }

  return new ContainerBuilder()
    .setAccentColor(0x1a73e8)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('## BOI Training Session')
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `We will be hosting a BOI Training session today, beginning <t:${timestamp}:R>.\n` +
        `<@&1491020284554383492> <@&1488519314716889163>`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `This session will go over BOI procedures, expectations, and standards. Topics will include promotion criteria, conduct, jurisdiction, and general responsibilities within the department.\n\n` +
        `A practical scenario will be conducted to assess how you handle situations, communicate, and apply BOI standards correctly. Professionalism is expected at all times.\n\n` +
        `Completion of this training is required to operate within BOI.`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Attending**\n${attendList}`)
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`training_attend:${msgId}`)
            .setLabel('Attending')
            .setStyle(ButtonStyle.Success)
        )
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Instructing**\n${instructList}`)
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`training_instruct:${msgId}`)
            .setLabel('Instructing')
            .setStyle(ButtonStyle.Primary)
        )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('Cancel this training session.')
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`training_cancel:${msgId}`)
            .setLabel('Cancel Training')
            .setStyle(ButtonStyle.Danger)
        )
    );
}

// In-memory RSVP store for training announcements  { msgId → { timestamp, attending: Set, instructing: Set } }
const trainingRSVPs = new Map();

// ──────────────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────────────

function getNextLowerRole(roleId) {
  const idx = HIERARCHY.indexOf(roleId);
  if (idx === -1 || idx >= HIERARCHY.length - 1) return null;
  return HIERARCHY[idx + 1];
}

function getNextHigherRole(roleId) {
  const idx = HIERARCHY.indexOf(roleId);
  if (idx <= 0) return null;
  return HIERARCHY[idx - 1];
}

function roleName(roleId) {
  return ROLE_NAMES[roleId] || `<@&${roleId}>`;
}

async function getOrFetchMember(guild, userId) {
  try {
    return guild.members.cache.get(userId) || await guild.members.fetch(userId);
  } catch {
    return null;
  }
}

async function sendLog(guild, channelId, embed) {
  try {
    const ch = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
    if (ch) await ch.send({ embeds: [embed] });
  } catch (err) {
    console.error('Failed to send log:', err);
  }
}

async function dmUser(user, embed) {
  try {
    await user.send({ embeds: [embed] });
  } catch {
    // DMs may be closed — silently ignore
  }
}

// Parses duration strings like 30m, 2h, 1d, 1w → milliseconds. Returns null if invalid/missing.
function parseDuration(str) {
  if (!str) return null;
  const match = str.trim().match(/^(\d+)([mhdw])$/i);
  if (!match) return null;
  const n = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const ms = { m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 }[unit];
  return n * ms;
}

// Maps bot action types to the sheet's Punishment column values
const SHEET_TYPE_MAP = {
  warn:      'Warning',
  strike:    'Strike',
  demote:    'Demote',
  promote:   'Promote',
  terminate: 'Termination',
  investigate: 'Investigation',
  clearinvestigation: 'Investigation Cleared',
  trainee:   'Trainee Assigned',
  graduate:  'Graduated',
  removestrike: 'Strike Removed',
};

// Fire-and-forget POST to Google Apps Script web app
async function logToSheet(type, targetMember, targetId, reason, evidence) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  const storedRpName = db.getRpName(targetId);
  const displayName = storedRpName
    || (targetMember && typeof targetMember === 'object' ? (targetMember.nickname || targetMember.user?.username || targetMember) : targetMember);
  const body = JSON.stringify({
    rpName:     displayName,
    discordId:  targetId,
    dateGiven:  new Date().toLocaleDateString('en-GB'),
    punishment: SHEET_TYPE_MAP[type] || type,
    reason:     reason || '',
    evidence:   evidence || '',
  });
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, redirect: 'follow' })
    .then(res => res.text().then(t => console.log('Sheet log response:', res.status, t)))
    .catch(err => console.error('Sheet log failed:', err));
}

// Move a member between rank rows on Compiled Data. Returns 'OK', 'NO_SPACE', or 'ERROR'.
async function sheetMoveRank(discordId, rpName, fromRankName, toRankName) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return 'OK';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'rankchange', discordId, rpName, fromRank: fromRankName, toRank: toRankName }),
      redirect: 'follow',
    });
    const text = (await res.text()).trim();
    console.log('Rank change sheet response:', text);
    // Returns 'NO_SPACE', 'CALLSIGN:XX-##', etc.
    return text;
  } catch (err) {
    console.error('Sheet rank change failed:', err);
    return 'ERROR';
  }
} // returns callsign string e.g. 'TRAINEE-3', or null
async function logTraineeToSheet(rpName, discordId, timezone) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return null;
  const body = JSON.stringify({ type: 'trainee', rpName, discordId, timezone: timezone || '' });
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, redirect: 'follow' });
    const text = (await res.text()).trim();
    console.log('Trainee sheet response:', text);
    return text.startsWith('TRAINEE-') ? text : null;
  } catch (err) {
    console.error('Trainee sheet log failed:', err);
    return null;
  }
}

const ACTION_LABELS = {
  warn:      'You Have Been Warned',
  strike:    'You Have Received a Strike',
  demote:    'You Have Been Demoted',
  terminate: 'You Have Been Terminated',
  investigate: 'You Are Under Investigation',
};

// ──────────────────────────────────────────────────────────────────
//  Interaction handler
// ──────────────────────────────────────────────────────────────────

client.on(Events.InteractionCreate, async interaction => {

  // ── String select menu: appeal punishment picker ────────────────
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'appeal_select') {
      const draft = db.getAppealDraft(interaction.user.id);
      if (!draft) return interaction.reply({ content: 'Appeal session expired. Please run `/appeal` again.', flags: MessageFlags.Ephemeral });

      const recordId = parseInt(interaction.values[0]);
      const record   = db.getActionById(recordId);
      if (!record) return interaction.reply({ content: 'Punishment record not found.', flags: MessageFlags.Ephemeral });

      db.deleteAppealDraft(interaction.user.id);

      const appealCh = interaction.guild.channels.cache.get(CHANNELS.APPEAL_LOG)
        || await interaction.guild.channels.fetch(CHANNELS.APPEAL_LOG).catch(() => null);
      if (!appealCh) return interaction.reply({ content: 'Appeal log channel not found.', flags: MessageFlags.Ephemeral });

      const punishDate = `<t:${Math.floor(record.created_at / 1000)}:d>`;
      const appealEmbed = new EmbedBuilder()
        .setTitle('Punishment Appeal')
        .setColor(0x5865f2)
        .addFields(
          { name: 'Member', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Punishment Type', value: record.type.toUpperCase(), inline: true },
          { name: 'Punishment Date', value: punishDate, inline: true },
          { name: 'Original Reason', value: record.reason || 'None on record' },
          { name: 'Appeal Statement', value: draft.reason },
        )
        .setTimestamp();

      const appealMsg = await appealCh.send({
        embeds: [appealEmbed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`appeal_approve:PLACEHOLDER`).setLabel('✅ Approve Appeal').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`appeal_deny:PLACEHOLDER`).setLabel('❌ Deny Appeal').setStyle(ButtonStyle.Danger),
          )
        ]
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`appeal_approve:${appealMsg.id}`).setLabel('✅ Approve Appeal').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`appeal_deny:${appealMsg.id}`).setLabel('❌ Deny Appeal').setStyle(ButtonStyle.Danger),
      );
      await appealMsg.edit({ components: [row] });

      db.savePendingAppeal(appealMsg.id, { userId: interaction.user.id, recordId, reason: draft.reason });

      return interaction.update({ content: 'Your appeal has been submitted to HR for review.', components: [], embeds: [] });
    }
    return;
  }

  // ── Button: demote approval ──────────────────────────────────────
  // ── Training RSVP buttons ────────────────────────────────────────
  if (interaction.isButton() && (interaction.customId.startsWith('training_attend:') || interaction.customId.startsWith('training_instruct:') || interaction.customId.startsWith('training_cancel:'))) {
    const [btnAction, msgId] = interaction.customId.split(':');
    const userId = interaction.user.id;
    const member = interaction.member;

    if (!trainingRSVPs.has(msgId)) {
      return interaction.reply({ content: 'This training session is no longer tracked.', flags: MessageFlags.Ephemeral });
    }

    const rsvp = trainingRSVPs.get(msgId);

    // Cancel button — executor only
    if (btnAction === 'training_cancel') {
      if (userId !== rsvp.executorId) {
        return interaction.reply({ content: 'Only the person who scheduled this training can cancel it.', flags: MessageFlags.Ephemeral });
      }
      rsvp.cancelled = true;
      const cancelledContainer = buildTrainingContainer(msgId, rsvp.timestamp, rsvp.attending, rsvp.instructing, true);
      await interaction.message.edit({ flags: MessageFlags.IsComponentsV2, components: [cancelledContainer] });
      await interaction.reply({ content: 'Training has been cancelled.', flags: MessageFlags.Ephemeral });
      return;
    }

    if (btnAction === 'training_attend') {
      if (!member.roles.cache.has('1491020284554383492')) {
        return interaction.reply({ content: 'Only <@&1491020284554383492> members can mark attendance.', flags: MessageFlags.Ephemeral });
      }
      if (rsvp.attending.has(userId)) {
        rsvp.attending.delete(userId);
        await interaction.reply({ content: 'You have removed your attendance.', flags: MessageFlags.Ephemeral });
      } else {
        rsvp.attending.add(userId);
        rsvp.instructing.delete(userId);
        await interaction.reply({ content: '✅ You are marked as attending!', flags: MessageFlags.Ephemeral });
      }
    } else {
      if (!member.roles.cache.has('1488519314716889163')) {
        return interaction.reply({ content: 'Only <@&1488519314716889163> members can mark themselves as instructors.', flags: MessageFlags.Ephemeral });
      }
      if (rsvp.instructing.has(userId)) {
        rsvp.instructing.delete(userId);
        await interaction.reply({ content: 'You have removed yourself as instructor.', flags: MessageFlags.Ephemeral });
      } else {
        rsvp.instructing.add(userId);
        rsvp.attending.delete(userId);
        await interaction.reply({ content: '<:boiseal:1492851288616992790> You are marked as an instructor!', flags: MessageFlags.Ephemeral });
      }
    }

    // Rebuild with Components V2
    const updatedContainer = buildTrainingContainer(msgId, rsvp.timestamp, rsvp.attending, rsvp.instructing);
    await interaction.message.edit({
      flags: MessageFlags.IsComponentsV2,
      components: [updatedContainer],
    });
    return;
  }

  if (interaction.isButton()) {
    const parts = interaction.customId.split(':');
    const action = parts[0];
    const id     = parts[1];

    // ── Terminate confirmation ─────────────────────────────────────
    if (action === 'terminate_confirm' || action === 'terminate_cancel') {
      // Only the original executor may click
      const executorId = parts[2];
      if (interaction.user.id !== executorId) {
        return interaction.reply({ content: 'Only the person who ran this command can confirm.', flags: MessageFlags.Ephemeral });
      }

      if (action === 'terminate_cancel') {
        await interaction.update({ content: 'Termination cancelled.', embeds: [], components: [] });
        return;
      }

      // Reconstruct data stored in button ID
      const targetId = id;
      const reasonB64 = parts[3];
      const evidenceB64 = parts[4] || '';
      const reason   = Buffer.from(reasonB64, 'base64').toString('utf8');
      const evidence = evidenceB64 ? Buffer.from(evidenceB64, 'base64').toString('utf8') : null;

      const guild  = interaction.guild;
      const target = await getOrFetchMember(guild, targetId);

      if (!target) {
        await interaction.update({ content: 'Could not find that user.', components: [] });
        return;
      }

      const targetRoleId = getHighestRole(target);

      const logEmbed = new EmbedBuilder()
        .setTitle('Member Terminated')
        .setColor(0x992d22)
        .addFields(
          { name: 'User', value: `<@${targetId}> (${target.user.tag})`, inline: true },
          { name: 'Rank', value: targetRoleId ? roleName(targetRoleId) : 'Unknown', inline: true },
          { name: 'Terminated By', value: `<@${executorId}>`, inline: true },
          { name: 'Reason', value: reason },
        );
      if (evidence) logEmbed.addFields({ name: 'Evidence', value: evidence });
      logEmbed.setTimestamp();

      // DM before kick
      await dmUser(target.user, new EmbedBuilder()
        .setTitle(ACTION_LABELS.terminate)
        .setColor(0x992d22)
        .setDescription('You have been terminated from the Bureau of Operational Integrity.')
        .addFields(
          { name: 'Reason', value: reason },
        )
        .setTimestamp()
      );

      try {
        await target.kick(`Terminated by <@${executorId}>: ${reason}`);
      } catch (err) {
        await interaction.update({ content: `Failed to kick: ${err.message}`, components: [] });
        return;
      }

      db.logAction('terminate', targetId, executorId, reason, evidence, { rank: targetRoleId });
      logToSheet('terminate', target, targetId, reason, evidence);
      await sendLog(guild, CHANNELS.TERMINATION_LOG, logEmbed);
      await interaction.update({ content: 'Termination executed.', embeds: [logEmbed], components: [] });
      return;
    }

    // ── Demote approval ────────────────────────────────────────────
    if (action === 'demote_approve' || action === 'demote_deny') {
      const pending = db.getPendingDemotion(id);
      if (!pending) {
        return interaction.reply({ content: 'This approval request has expired or was already handled.', flags: MessageFlags.Ephemeral });
      }

      const approver = interaction.member;
      if (!hasOverride(approver) && !hasAtLeast(approver, ROLES.SR_STRATEGIC)) {
        return interaction.reply({ content: 'Only Senior Strategic Director and above can approve or deny demotion requests.', flags: MessageFlags.Ephemeral });
      }

      db.deletePendingDemotion(id);

      if (action === 'demote_deny') {
        await interaction.update({
          content: `Demotion request denied by <@${approver.id}>.`,
          embeds: interaction.message.embeds,
          components: [],
        });
        return;
      }

      // Approve
      const guild  = interaction.guild;
      const target = await getOrFetchMember(guild, pending.targetId);
      if (!target) {
        await interaction.update({ content: 'Could not find the target user.', components: [] });
        return;
      }

      const rpNameForSheet = db.getRpName(pending.targetId) || target.nickname || target.user.username;
      const sheetResult = await sheetMoveRank(pending.targetId, rpNameForSheet, roleName(pending.oldRoleId), roleName(pending.newRoleId));
      if (sheetResult === 'NO_SPACE') {
        await interaction.update({ content: `There are no available slots for **${roleName(pending.newRoleId)}** on the roster. Free up a spot first.`, embeds: [], components: [] });
        return;
      }

      try {
        await target.roles.remove(pending.oldRoleId);
        await target.roles.add(pending.newRoleId);
      } catch (err) {
        await interaction.update({ content: `Failed to update roles: ${err.message}`, components: [] });
        return;
      }

      if (sheetResult.startsWith('CALLSIGN:')) {
        const newCallsign = sheetResult.slice('CALLSIGN:'.length);
        target.setNickname(`${newCallsign} | ${rpNameForSheet}`).catch(() => {});
      }

      await interaction.update({
        content: `Demotion approved by <@${approver.id}>.`,
        embeds: interaction.message.embeds,
        components: [],
      });

      // DM target
      await dmUser(target.user, new EmbedBuilder()
        .setTitle(ACTION_LABELS.demote)
        .setColor(0xe74c3c)
        .addFields(
          { name: 'From', value: roleName(pending.oldRoleId), inline: true },
          { name: 'To', value: roleName(pending.newRoleId), inline: true },
          { name: 'Reason', value: pending.reason },
        )
        .setTimestamp()
      );

      const logEmbed = new EmbedBuilder()
        .setTitle('Member Demoted')
        .setColor(0xe74c3c)
        .addFields(
          { name: 'User', value: `<@${pending.targetId}>`, inline: true },
          { name: 'From', value: roleName(pending.oldRoleId), inline: true },
          { name: 'To', value: roleName(pending.newRoleId), inline: true },
          { name: 'Requested By', value: `<@${pending.executorId}>`, inline: true },
          { name: 'Approved By', value: `<@${approver.id}>`, inline: true },
          { name: 'Reason', value: pending.reason },
        );
      if (pending.evidence) logEmbed.addFields({ name: 'Evidence', value: pending.evidence });
      logEmbed.setTimestamp();

      db.logAction('demote', pending.targetId, pending.executorId, pending.reason, pending.evidence, {
        from: pending.oldRoleId,
        to: pending.newRoleId,
        approvedBy: approver.id,
      });

      await sendLog(guild, CHANNELS.DEMOTION_LOG, logEmbed);
      return;
    }

    // ── Appeal approve/deny ────────────────────────────────────────
    if (action === 'appeal_approve' || action === 'appeal_deny') {
      const pending = db.getPendingAppeal(id);
      if (!pending) {
        return interaction.reply({ content: 'This appeal has already been handled or expired.', flags: MessageFlags.Ephemeral });
      }

      const reviewer = interaction.member;
      if (!hasOverride(reviewer) && !hasAtLeast(reviewer, ROLES.SR_STRATEGIC)) {
        return interaction.reply({ content: 'Only **Senior Strategic Director** and above can review appeals.', flags: MessageFlags.Ephemeral });
      }

      db.deletePendingAppeal(id);

      const approved = action === 'appeal_approve';
      const resultText = approved ? 'Appeal **approved**' : 'Appeal **denied**';
      const color      = approved ? 0x2ecc71 : 0xe74c3c;

      await interaction.update({
        embeds: [
          EmbedBuilder.from(interaction.message.embeds[0])
            .setColor(color)
            .addFields({ name: 'Decision', value: `${resultText} by <@${reviewer.id}>` }),
        ],
        components: [],
      });

      // DM the member with the outcome
      try {
        const appealUser = await interaction.client.users.fetch(pending.user_id);
        await dmUser(appealUser, new EmbedBuilder()
          .setTitle(`Appeal ${approved ? 'Approved' : 'Denied'}`)
          .setColor(color)
          .setDescription(approved
            ? `Your appeal has been approved by <@${reviewer.id}>.`
            : `Your appeal has been reviewed and denied by <@${reviewer.id}>.`)
          .setTimestamp()
        );
      } catch { /* ignore */ }

      return;
    }

    // ── Application accept/deny ────────────────────────────────────
    if (action === 'app_accept' || action === 'app_deny') {
      const applicantId = id; // user ID embedded in custom_id
      const reviewer    = interaction.member;

      if (!hasOverride(reviewer) && !hasAtLeast(reviewer, ROLES.CMD_OPS_MANAGER)) {
        return interaction.reply({ content: 'You do not have permission to action applications.', flags: MessageFlags.Ephemeral });
      }

      const accepted = action === 'app_accept';

      // Disable the buttons on the original message
      await interaction.message.edit({ components: [] }).catch(() => {});

      // DM the applicant
      try {
        const applicant = await interaction.client.users.fetch(applicantId);
        const dmEmbed = new EmbedBuilder()
          .setColor(accepted ? 0xc9a228 : 0x992d22)
          .setTitle(accepted ? 'BOI Application — Next Steps' : 'BOI Application — Update')
          .setDescription(accepted
            ? `Hey ${applicant.username}, congratulations, you have passed the first stage of the BOI application process. Your written responses met the standard we look for.\n\nThe next step is a short verbal interview. DM me back with a time that works for you and we will get that scheduled.`
            : `Hey ${applicant.username}, thank you for submitting an application to the Bureau of Operational Integrity.\n\nAfter review, we will not be moving forward with your application at this time. You are welcome to reapply in the future.`)
          .setFooter({ text: 'Bureau of Operational Integrity' })
          .setTimestamp();

        await applicant.send({ embeds: [dmEmbed] });
      } catch {
        // DMs closed — silently continue
      }

      return interaction.reply({
        content: `Application ${accepted ? 'accepted' : 'denied'} by <@${reviewer.id}>. Applicant <@${applicantId}> has been notified via DM.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const { commandName, guild, member } = interaction;
  if (!guild) return interaction.reply({ content: 'This command must be used in a server.', flags: MessageFlags.Ephemeral });

  // Prevent self-targeting on any command except /history
  const selfCheckTarget = interaction.options.getMember('user');
  if (selfCheckTarget && selfCheckTarget.id === member.id && commandName !== 'history' && commandName !== 'setrpname') {
    return interaction.reply({ content: 'You cannot use this command on yourself.', flags: MessageFlags.Ephemeral });
  }

  // Defer immediately to avoid the 3-second interaction timeout
  await interaction.deferReply({ ephemeral: true });

  // ── /trainee ────────────────────────────────────────────────────
  if (commandName === 'trainee') {
    if (!hasOverride(member) && !hasAtLeast(member, ROLES.CMD_LIAISON) && !member.roles.cache.has(ROLES.BUREAU_TRAINING_ACADEMY)) {
      return interaction.editReply({ content: 'You need to be at least **Command Liaison Officer** to run this command.', flags: MessageFlags.Ephemeral });
    }

    const target = interaction.options.getMember('user');
    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    if (!hasOverride(member) && !member.roles.cache.has(ROLES.BUREAU_TRAINING_ACADEMY) && !outranks(member, target)) {
      return interaction.editReply({ content: 'You can only assign trainee to users below your rank.', flags: MessageFlags.Ephemeral });
    }

    if (getHighestRole(target)) {
      return interaction.editReply({ content: 'That user already has a BOI rank and cannot be assigned as a trainee.', flags: MessageFlags.Ephemeral });
    }

    try {
      await target.roles.add(ROLES.AGENT_IN_TRAINING);
    } catch (err) {
      return interaction.editReply({ content: `Failed to assign role: ${err.message}`, flags: MessageFlags.Ephemeral });
    }

    const rpName = interaction.options.getString('rpname');
    const timezone = interaction.options.getString('timezone') || null;
    if (rpName) db.saveRpName(target.id, rpName);

    const callsign = await logTraineeToSheet(rpName || target.nickname || target.user.username, target.id, timezone);

    let nicknamSet = true;
    if (callsign && rpName) {
      try {
        await target.setNickname(`${callsign} | ${rpName}`);
      } catch (err) {
        nicknamSet = false;
        console.error('Failed to set nickname:', err);
      }
    }

    db.logAction('trainee', target.id, member.id, null, null, null);

    const embed = new EmbedBuilder()
      .setTitle('Agent in Training Assigned')
      .setColor(0x3498db)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'RP Name', value: rpName || db.getRpName(target.id) || target.nickname || target.user.username, inline: true },
        { name: 'Callsign', value: callsign || 'Sheet full / unavailable', inline: true },
        { name: 'Timezone', value: timezone || 'Not provided', inline: true },
        { name: 'Role', value: roleName(ROLES.AGENT_IN_TRAINING), inline: true },
        { name: 'Nickname Set', value: nicknamSet ? `\`${callsign} | ${rpName}\`` : '⚠️ Could not set — bot lacks permission or user is higher role', inline: false },
        { name: 'Assigned By', value: `<@${member.id}>`, inline: true },
      )
      .setTimestamp();

    // DM target
    await dmUser(target.user, new EmbedBuilder()
      .setTitle('You Have Been Assigned as Agent in Training')
      .setColor(0x3498db)
      .setDescription('Welcome to the Bureau of Operational Integrity!')
      .setTimestamp()
    );

    await sendLog(guild, CHANNELS.GRADUATE_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /graduate ───────────────────────────────────────────────────
  if (commandName === 'graduate') {
    if (!hasOverride(member) && !hasAtLeast(member, ROLES.CMD_LIAISON) && !member.roles.cache.has(ROLES.BUREAU_TRAINING_ACADEMY)) {
      return interaction.editReply({ content: 'You need to be at least **Command Liaison Officer** to run this command.', flags: MessageFlags.Ephemeral });
    }

    const target = interaction.options.getMember('user');
    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    if (!target.roles.cache.has(ROLES.AGENT_IN_TRAINING)) {
      return interaction.editReply({ content: 'That user does not have the **Agent in Training** role.', flags: MessageFlags.Ephemeral });
    }

    if (!hasOverride(member) && !member.roles.cache.has(ROLES.BUREAU_TRAINING_ACADEMY) && !outranks(member, target)) {
      return interaction.editReply({ content: 'You can only graduate users below your rank.', flags: MessageFlags.Ephemeral });
    }

    try {
      await target.roles.remove(ROLES.AGENT_IN_TRAINING);
      await target.roles.add(ROLES.FIELD_AGENT);
      await target.roles.add('1488519325748035624');
    } catch (err) {
      return interaction.editReply({ content: `Failed to update roles: ${err.message}`, flags: MessageFlags.Ephemeral });
    }

    db.logAction('graduate', target.id, member.id, null, null, null);

    // Move on sheet: remove from trainee section, add to field agent section
    const rpName = db.getRpName(target.id);
    const url = process.env.SHEETS_WEBHOOK_URL;
    if (url) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'graduate', discordId: target.id, rpName: rpName || target.nickname || target.user.username }),
        redirect: 'follow',
      }).then(r => r.text().then(async callsign => {
        console.log('Graduate sheet response:', callsign);
        callsign = callsign.trim();
        if (callsign && callsign !== 'FULL' && callsign !== 'Sheet not found' && rpName) {
          try {
            await target.setNickname(`${callsign} | ${rpName}`);
          } catch (err) {
            console.error('Failed to set graduate nickname:', err);
          }
        }
      })).catch(console.error);
    }

    const embed = new EmbedBuilder()
      .setTitle('Trainee Graduated')
      .setColor(0x2ecc71)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'Graduated By', value: `<@${member.id}>`, inline: true },
      )
      .setTimestamp();

    // DM target
    await dmUser(target.user, new EmbedBuilder()
      .setTitle('You Have Graduated!')
      .setColor(0x2ecc71)
      .setDescription('Congratulations! You have graduated from training and been promoted to **Field Agent**.')
      .setTimestamp()
    );

    await sendLog(guild, CHANNELS.GRADUATE_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /promote ────────────────────────────────────────────────────
  if (commandName === 'promote') {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const approvedByUser = interaction.options.getUser('approvedby');
    const approvedById = approvedByUser ? approvedByUser.id : member.id;

    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    const executorRoleId = getHighestRole(member);
    const targetRoleId   = getHighestRole(target);

    if (!hasOverride(member)) {
      if (!executorRoleId) return interaction.editReply({ content: 'You have no BOI rank.', flags: MessageFlags.Ephemeral });

      if (!outranks(member, target)) {
        return interaction.editReply({ content: 'You can only promote users below your rank.', flags: MessageFlags.Ephemeral });
      }

      const executorIdx    = getHighestRankIndex(member);
      const srStrategicIdx = HIERARCHY.indexOf(ROLES.SR_STRATEGIC);
      const cmdLiaisonIdx  = HIERARCHY.indexOf(ROLES.CMD_LIAISON);

      let ceilingIdx;
      if (executorIdx === cmdLiaisonIdx) {
        ceilingIdx = HIERARCHY.indexOf(ROLES.SR_CMD_ADVISOR);
      } else if (executorIdx <= srStrategicIdx) {
        ceilingIdx = cmdLiaisonIdx;
      } else {
        return interaction.editReply({ content: 'You do not have permission to promote members.', flags: MessageFlags.Ephemeral });
      }

      const targetIdx  = HIERARCHY.indexOf(targetRoleId);
      const newRoleIdx = targetIdx - 1;

      if (newRoleIdx < 0) {
        return interaction.editReply({ content: 'This user is already at the highest rank.', flags: MessageFlags.Ephemeral });
      }
      if (newRoleIdx < ceilingIdx) {
        return interaction.editReply({ content: `You can only promote up to **${roleName(HIERARCHY[ceilingIdx])}**.`, flags: MessageFlags.Ephemeral });
      }
    }

    if (!targetRoleId) {
      return interaction.editReply({ content: 'That user has no BOI rank to promote from.', flags: MessageFlags.Ephemeral });
    }

    const newRoleId = getNextHigherRole(targetRoleId);
    if (!newRoleId) {
      return interaction.editReply({ content: 'This user is already at the highest rank.', flags: MessageFlags.Ephemeral });
    }

    const rpNameForSheet = db.getRpName(target.id) || target.nickname || target.user.username;
    const sheetResult = await sheetMoveRank(target.id, rpNameForSheet, roleName(targetRoleId), roleName(newRoleId));
    if (sheetResult === 'NO_SPACE') {
      return interaction.editReply({ content: `There are no available slots for **${roleName(newRoleId)}** on the roster. Free up a spot before promoting.`, flags: MessageFlags.Ephemeral });
    }

    try {
      await target.roles.remove(targetRoleId);
      await target.roles.add(newRoleId);
    } catch (err) {
      return interaction.editReply({ content: `Failed to update roles: ${err.message}`, flags: MessageFlags.Ephemeral });
    }

    if (sheetResult.startsWith('CALLSIGN:')) {
      const newCallsign = sheetResult.slice('CALLSIGN:'.length);
      target.setNickname(`${newCallsign} | ${rpNameForSheet}`).catch(() => {});
    }

    db.logAction('promote', target.id, member.id, reason, null, { from: targetRoleId, to: newRoleId, approvedBy: approvedById });

    const embed = new EmbedBuilder()
      .setTitle('Member Promoted')
      .setColor(0x2ecc71)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'From', value: roleName(targetRoleId), inline: true },
        { name: 'To', value: roleName(newRoleId), inline: true },
        { name: 'Promoted By', value: `<@${member.id}>`, inline: true },
        { name: 'Approved By', value: `<@${approvedById}>`, inline: true },
        { name: 'Reason', value: reason },
      )
      .setTimestamp();

    // DM target
    await dmUser(target.user, new EmbedBuilder()
      .setTitle('You Have Been Promoted!')
      .setColor(0x2ecc71)
      .addFields(
        { name: 'From', value: roleName(targetRoleId), inline: true },
        { name: 'To', value: roleName(newRoleId), inline: true },
        { name: 'Reason', value: reason },
      )
      .setTimestamp()
    );

    await sendLog(guild, CHANNELS.PROMOTION_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /demote ─────────────────────────────────────────────────────
  if (commandName === 'demote') {
    const target   = interaction.options.getMember('user');
    const reason   = interaction.options.getString('reason');
    const evidence = interaction.options.getString('evidence') || null;

    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    const targetRoleId = getHighestRole(target);

    if (!hasOverride(member)) {
      const executorIdx   = getHighestRankIndex(member);
      const cmdLiaisonIdx = HIERARCHY.indexOf(ROLES.CMD_LIAISON);
      const srStratIdx    = HIERARCHY.indexOf(ROLES.SR_STRATEGIC);

      if (executorIdx > cmdLiaisonIdx) {
        return interaction.editReply({ content: 'You need to be at least **Command Liaison Officer** to demote members.', flags: MessageFlags.Ephemeral });
      }
      if (!outranks(member, target)) {
        return interaction.editReply({ content: 'You can only demote users below your rank.', flags: MessageFlags.Ephemeral });
      }

      const directorIdx = HIERARCHY.indexOf(ROLES.DIRECTOR);
      if (targetRoleId && HIERARCHY.indexOf(targetRoleId) <= srStratIdx && executorIdx > directorIdx) {
        return interaction.editReply({ content: '**Senior Strategic Director** and above can only be demoted by the **Director of Operational Integrity**.', flags: MessageFlags.Ephemeral });
      }

      // CLO → needs approval
      if (executorIdx === cmdLiaisonIdx) {
        if (!targetRoleId) return interaction.editReply({ content: 'That user has no BOI rank.', flags: MessageFlags.Ephemeral });

        const newRoleId = getNextLowerRole(targetRoleId);
        if (!newRoleId) return interaction.editReply({ content: 'This user is already at the lowest rank.', flags: MessageFlags.Ephemeral });

        const approvalCh = guild.channels.cache.get(CHANNELS.APPROVAL_LOG) || await guild.channels.fetch(CHANNELS.APPROVAL_LOG).catch(() => null);
        if (!approvalCh) return interaction.editReply({ content: 'Approval channel not found.', flags: MessageFlags.Ephemeral });

        const approvalEmbed = new EmbedBuilder()
          .setTitle('Demotion Approval Required')
          .setColor(0xe67e22)
          .addFields(
            { name: 'User', value: `<@${target.id}>`, inline: true },
            { name: 'From', value: roleName(targetRoleId), inline: true },
            { name: 'To', value: roleName(newRoleId), inline: true },
            { name: 'Requested By', value: `<@${member.id}>`, inline: true },
            { name: 'Reason', value: reason },
          );
        if (evidence) approvalEmbed.addFields({ name: 'Evidence', value: evidence });
        approvalEmbed.setTimestamp();

        const approvalMsg = await approvalCh.send({
          content: 'A demotion request requires approval from **Senior Strategic Director** or above. <@&1488519183552479333>',
          embeds: [approvalEmbed],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`demote_approve:PLACEHOLDER`).setLabel('Approve').setStyle(ButtonStyle.Success),
              new ButtonBuilder().setCustomId(`demote_deny:PLACEHOLDER`).setLabel('Deny').setStyle(ButtonStyle.Danger),
            )
          ]
        });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`demote_approve:${approvalMsg.id}`).setLabel('Approve').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`demote_deny:${approvalMsg.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger),
        );
        await approvalMsg.edit({ components: [row] });

        db.savePendingDemotion(approvalMsg.id, {
          executorId: member.id,
          targetId: target.id,
          oldRoleId: targetRoleId,
          newRoleId,
          reason,
          evidence,
        });

        return interaction.editReply({ content: `Your demotion request for <@${target.id}> has been sent for approval.`, flags: MessageFlags.Ephemeral });
      }

      if (!targetRoleId) return interaction.editReply({ content: 'That user has no BOI rank.', flags: MessageFlags.Ephemeral });
    }

    if (!targetRoleId) return interaction.editReply({ content: 'That user has no BOI rank.', flags: MessageFlags.Ephemeral });

    const newRoleId = getNextLowerRole(targetRoleId);
    if (!newRoleId) return interaction.editReply({ content: 'This user is already at the lowest rank.', flags: MessageFlags.Ephemeral });

    const rpNameForSheet = db.getRpName(target.id) || target.nickname || target.user.username;
    const sheetResult = await sheetMoveRank(target.id, rpNameForSheet, roleName(targetRoleId), roleName(newRoleId));
    if (sheetResult === 'NO_SPACE') {
      return interaction.editReply({ content: `There are no available slots for **${roleName(newRoleId)}** on the roster. Free up a spot before demoting.`, flags: MessageFlags.Ephemeral });
    }

    try {
      await target.roles.remove(targetRoleId);
      await target.roles.add(newRoleId);
    } catch (err) {
      return interaction.editReply({ content: `Failed to update roles: ${err.message}`, flags: MessageFlags.Ephemeral });
    }

    if (sheetResult.startsWith('CALLSIGN:')) {
      const newCallsign = sheetResult.slice('CALLSIGN:'.length);
      target.setNickname(`${newCallsign} | ${rpNameForSheet}`).catch(() => {});
    }

    db.logAction('demote', target.id, member.id, reason, evidence, { from: targetRoleId, to: newRoleId });

    // DM target
    await dmUser(target.user, new EmbedBuilder()
      .setTitle(ACTION_LABELS.demote)
      .setColor(0xe74c3c)
      .addFields(
        { name: 'From', value: roleName(targetRoleId), inline: true },
        { name: 'To', value: roleName(newRoleId), inline: true },
        { name: 'Reason', value: reason },
      )
      .setTimestamp()
    );

    const embed = new EmbedBuilder()
      .setTitle('Member Demoted')
      .setColor(0xe74c3c)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'From', value: roleName(targetRoleId), inline: true },
        { name: 'To', value: roleName(newRoleId), inline: true },
        { name: 'Demoted By', value: `<@${member.id}>`, inline: true },
        { name: 'Reason', value: reason },
      );
    if (evidence) embed.addFields({ name: 'Evidence', value: evidence });
    embed.setTimestamp();

    await sendLog(guild, CHANNELS.DEMOTION_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /terminate ──────────────────────────────────────────────────
  if (commandName === 'terminate') {
    const target   = interaction.options.getMember('user');
    const reason   = interaction.options.getString('reason');
    const evidence = interaction.options.getString('evidence') || null;

    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    if (!hasOverride(member)) {
      if (!hasAtLeast(member, ROLES.SR_STRATEGIC)) {
        return interaction.editReply({ content: 'You need to be at least **Senior Strategic Director** to terminate members.', flags: MessageFlags.Ephemeral });
      }
      if (!outranks(member, target)) {
        return interaction.editReply({ content: 'You can only terminate users below your rank.', flags: MessageFlags.Ephemeral });
      }
    }

    const targetRoleId = getHighestRole(target);

    // Encode reason/evidence in base64 to safely embed in button ID
    const reasonB64   = Buffer.from(reason).toString('base64');
    const evidenceB64 = evidence ? Buffer.from(evidence).toString('base64') : '';

    const confirmEmbed = new EmbedBuilder()
      .setTitle('Confirm Termination')
      .setColor(0xe74c3c)
      .setDescription(`Are you sure you want to terminate <@${target.id}>?`)
      .addFields(
        { name: 'Rank', value: targetRoleId ? roleName(targetRoleId) : 'Unknown', inline: true },
        { name: 'Reason', value: reason },
      );
    if (evidence) confirmEmbed.addFields({ name: 'Evidence', value: evidence });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`terminate_confirm:${target.id}:${member.id}:${reasonB64}:${evidenceB64}`)
        .setLabel('Confirm Terminate')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`terminate_cancel:${target.id}:${member.id}:${reasonB64}:${evidenceB64}`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    );

    return interaction.editReply({ embeds: [confirmEmbed], components: [row], flags: MessageFlags.Ephemeral });
  }

  // ── /investigate ────────────────────────────────────────────────
  if (commandName === 'investigate') {
    const target   = interaction.options.getMember('user');
    const reason   = interaction.options.getString('reason');
    const evidence = interaction.options.getString('evidence') || null;

    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    if (!hasOverride(member)) {
      if (!hasAtLeast(member, ROLES.CMD_LIAISON)) {
        return interaction.editReply({ content: 'You need to be at least **Command Liaison Officer** to investigate members.', flags: MessageFlags.Ephemeral });
      }
      if (!outranks(member, target)) {
        return interaction.editReply({ content: 'You can only investigate users below your rank.', flags: MessageFlags.Ephemeral });
      }

      const srStratIdx  = HIERARCHY.indexOf(ROLES.SR_STRATEGIC);
      const directorIdx = HIERARCHY.indexOf(ROLES.DIRECTOR);
      const targetIdx   = getHighestRankIndex(target);
      const executorIdx = getHighestRankIndex(member);

      if (targetIdx <= srStratIdx && executorIdx > directorIdx) {
        return interaction.editReply({ content: '**Senior Strategic Director** and above can only be investigated by the **Director of Operational Integrity**.', flags: MessageFlags.Ephemeral });
      }
    }

    if (db.getInvestigation(target.id)) {
      return interaction.editReply({ content: 'That user is already under investigation.', flags: MessageFlags.Ephemeral });
    }

    const storedRoles = target.roles.cache
      .filter(r => r.id !== guild.id && r.id !== ROLES.UNDER_INVESTIGATION)
      .map(r => r.id);

    db.startInvestigation(target.id, storedRoles, reason, member.id);

    try {
      await target.roles.set([ROLES.UNDER_INVESTIGATION]);
    } catch (err) {
      db.clearInvestigation(target.id);
      return interaction.editReply({ content: `Failed to update roles: ${err.message}`, flags: MessageFlags.Ephemeral });
    }

    db.logAction('investigate', target.id, member.id, reason, evidence, null);

    // DM target
    await dmUser(target.user, new EmbedBuilder()
      .setTitle(ACTION_LABELS.investigate)
      .setColor(0xf39c12)
      .setDescription('Your roles have been temporarily removed pending investigation.')
      .addFields({ name: 'Reason', value: reason })
      .setTimestamp()
    );

    const embed = new EmbedBuilder()
      .setTitle('Investigation Initiated')
      .setColor(0xf39c12)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'Initiated By', value: `<@${member.id}>`, inline: true },
        { name: 'Reason', value: reason },
      );
    if (evidence) embed.addFields({ name: 'Evidence', value: evidence });
    embed.setTimestamp();

    await sendLog(guild, CHANNELS.INVESTIGATION_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /clearinvestigation ─────────────────────────────────────────
  if (commandName === 'clearinvestigation') {
    const target = interaction.options.getMember('user');
    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    if (!hasOverride(member) && !hasAtLeast(member, ROLES.SR_STRATEGIC)) {
      return interaction.editReply({ content: 'You need to be at least **Senior Strategic Director** to clear investigations.', flags: MessageFlags.Ephemeral });
    }

    const inv = db.getInvestigation(target.id);
    if (!inv) {
      return interaction.editReply({ content: 'That user is not currently under investigation.', flags: MessageFlags.Ephemeral });
    }

    db.clearInvestigation(target.id);

    try {
      await target.roles.set(inv.roles);
    } catch (err) {
      return interaction.editReply({ content: `Failed to restore roles: ${err.message}`, flags: MessageFlags.Ephemeral });
    }

    db.logAction('clearinvestigation', target.id, member.id, null, null, null);

    // DM target
    await dmUser(target.user, new EmbedBuilder()
      .setTitle('Your Investigation Has Been Cleared')
      .setColor(0x2ecc71)
      .setDescription('Your roles have been restored.')
      .setTimestamp()
    );

    const embed = new EmbedBuilder()
      .setTitle('Investigation Cleared')
      .setColor(0x2ecc71)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'Cleared By', value: `<@${member.id}>`, inline: true },
      )
      .setTimestamp();

    await sendLog(guild, CHANNELS.INVESTIGATION_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /warn ───────────────────────────────────────────────────────
  if (commandName === 'warn') {
    const target   = interaction.options.getMember('user');
    const reason   = interaction.options.getString('reason');
    const evidence = interaction.options.getString('evidence') || null;

    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    if (!hasOverride(member)) {
      if (!hasAtLeast(member, ROLES.JR_FIELD_SUPERVISOR)) {
        return interaction.editReply({ content: 'You need to be at least **Junior Field Supervisor** to warn members.', flags: MessageFlags.Ephemeral });
      }
      if (!outranks(member, target)) {
        return interaction.editReply({ content: 'You can only warn users below your rank.', flags: MessageFlags.Ephemeral });
      }
    }

    db.logAction('warn', target.id, member.id, reason, evidence, null);
    logToSheet('warn', target, target.id, reason, evidence);

    // DM target
    await dmUser(target.user, new EmbedBuilder()
      .setTitle(ACTION_LABELS.warn)
      .setColor(0xf1c40f)
      .addFields(
        { name: 'Reason', value: reason },
        ...(evidence ? [{ name: 'Evidence', value: evidence }] : []),
      )
      .setTimestamp()
    );

    const embed = new EmbedBuilder()
      .setTitle('Member Warned')
      .setColor(0xf1c40f)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'Warned By', value: `<@${member.id}>`, inline: true },
        { name: 'Reason', value: reason },
      );
    if (evidence) embed.addFields({ name: 'Evidence', value: evidence });
    embed.setTimestamp();

    await sendLog(guild, CHANNELS.WARN_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /strike ─────────────────────────────────────────────────────
  if (commandName === 'strike') {
    const target   = interaction.options.getMember('user');
    const reason   = interaction.options.getString('reason');
    const evidence = interaction.options.getString('evidence') || null;
    const durationStr = interaction.options.getString('duration') || null;

    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    if (!hasOverride(member)) {
      if (!hasAtLeast(member, ROLES.CMD_OPS_MANAGER)) {
        return interaction.editReply({ content: 'You need to be at least **Command Operations Manager** to issue strikes.', flags: MessageFlags.Ephemeral });
      }
      if (!outranks(member, target)) {
        return interaction.editReply({ content: 'You can only strike users below your rank.', flags: MessageFlags.Ephemeral });
      }
    }

    const durationMs = parseDuration(durationStr);
    if (durationStr && !durationMs) {
      return interaction.editReply({ content: 'Invalid duration. Use formats like `30m`, `1h`, `2d`, `1w`.', flags: MessageFlags.Ephemeral });
    }

    try {
      await target.roles.add(ROLES.STRIKE);
    } catch (err) {
      return interaction.editReply({ content: `Failed to assign strike role: ${err.message}`, flags: MessageFlags.Ephemeral });
    }

    const expiresAt = durationMs ? Date.now() + durationMs : null;
    if (expiresAt) db.saveTimedStrike(target.id, expiresAt);

    db.logAction('strike', target.id, member.id, reason, evidence, durationStr ? { duration: durationStr, expiresAt } : null);
    logToSheet('strike', target, target.id, reason, evidence);

    const expiryText = expiresAt ? `\nExpires: <t:${Math.floor(expiresAt / 1000)}:R>` : '\nDuration: **Permanent**';

    // DM target
    await dmUser(target.user, new EmbedBuilder()
      .setTitle(ACTION_LABELS.strike)
      .setColor(0xe67e22)
      .addFields(
        { name: 'Reason', value: reason },
        ...(evidence ? [{ name: 'Evidence', value: evidence }] : []),
        { name: 'Duration', value: durationStr ? durationStr : 'Permanent' },
      )
      .setTimestamp()
    );

    const embed = new EmbedBuilder()
      .setTitle('Member Striked')
      .setColor(0xe67e22)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'Issued By', value: `<@${member.id}>`, inline: true },
        { name: 'Duration', value: durationStr ? durationStr : 'Permanent', inline: true },
        { name: 'Reason', value: reason },
      );
    if (evidence) embed.addFields({ name: 'Evidence', value: evidence });
    embed.setDescription(expiryText).setTimestamp();

    await sendLog(guild, CHANNELS.STRIKE_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /removestrike ────────────────────────────────────────────────
  if (commandName === 'removestrike') {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    if (!hasOverride(member)) {
      if (!hasAtLeast(member, ROLES.CMD_OPS_MANAGER)) {
        return interaction.editReply({ content: 'You need to be at least **Command Operations Manager** to remove strikes.', flags: MessageFlags.Ephemeral });
      }
    }

    if (!target.roles.cache.has(ROLES.STRIKE)) {
      return interaction.editReply({ content: 'That user does not have a strike.', flags: MessageFlags.Ephemeral });
    }

    try {
      await target.roles.remove(ROLES.STRIKE);
    } catch (err) {
      return interaction.editReply({ content: `Failed to remove strike role: ${err.message}`, flags: MessageFlags.Ephemeral });
    }

    db.deleteTimedStrike(target.id);
    db.logAction('removestrike', target.id, member.id, reason, null, null);
    logToSheet('removestrike', target, target.id, reason, null);

    await dmUser(target.user, new EmbedBuilder()
      .setTitle('Your Strike Has Been Removed')
      .setColor(0x2ecc71)
      .addFields({ name: 'Removed By', value: `<@${member.id}>`, inline: true })
      .setTimestamp()
    );

    const embed = new EmbedBuilder()
      .setTitle('Strike Removed')
      .setColor(0x2ecc71)
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'Removed By', value: `<@${member.id}>`, inline: true },
        { name: 'Reason', value: reason },
      )
      .setTimestamp();

    await sendLog(guild, CHANNELS.STRIKE_LOG, embed);
    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /lookup ──────────────────────────────────────────────────────
  if (commandName === 'lookup') {
    const target = interaction.options.getMember('user');
    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    const rankRoleId   = getHighestRole(target);
    const hasStrike    = target.roles.cache.has(ROLES.STRIKE);
    const timedStrike  = db.getTimedStrike(target.id);
    const investigation = db.getInvestigation(target.id);

    const strikeText = hasStrike
      ? timedStrike
        ? `Yes — expires <t:${Math.floor(timedStrike.expires_at / 1000)}:R>`
        : 'Yes — Permanent'
      : 'No';

    const embed = new EmbedBuilder()
      .setTitle(`Lookup — ${target.user.username}`)
      .setColor(0x2f3136)
      .setThumbnail(target.user.displayAvatarURL())
      .addFields(
        { name: 'Rank', value: rankRoleId ? roleName(rankRoleId) : 'No BOI rank', inline: true },
        { name: 'Strike', value: strikeText, inline: true },
        { name: 'Under Investigation', value: investigation ? `Yes — <t:${Math.floor(investigation.initiated_at / 1000)}:R>` : 'No', inline: true },
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /appeal ──────────────────────────────────────────────────────
  if (commandName === 'appeal') {
    const reason = interaction.options.getString('reason');
    const APPEALABLE = ['warn', 'strike', 'demote', 'terminate'];
    const records = db.getHistory(member.id, 50).filter(r => APPEALABLE.includes(r.type));

    if (!records.length) {
      return interaction.editReply({ content: 'You have no punishments to appeal.', flags: MessageFlags.Ephemeral });
    }

    db.saveAppealDraft(member.id, reason);

    const options = records.slice(0, 25).map(r => ({
      label: `${r.type.toUpperCase()} — ${new Date(r.created_at).toLocaleDateString('en-GB')}`,
      description: (r.reason || 'No reason on record').substring(0, 100),
      value: String(r.id),
    }));

    const select = new StringSelectMenuBuilder()
      .setCustomId('appeal_select')
      .setPlaceholder('Select the punishment you want to appeal')
      .addOptions(options);

    return interaction.editReply({
      content: 'Select which punishment you want to appeal:',
      components: [new ActionRowBuilder().addComponents(select)],
      flags: MessageFlags.Ephemeral,
    });
  }

  // ── /setrpname ──────────────────────────────────────────────────
  if (commandName === 'setrpname') {
    const target = interaction.options.getMember('user');
    if (!target) return interaction.editReply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });

    const isSelf = target.id === member.id;
    if (!isSelf && !hasOverride(member) && !hasAtLeast(member, ROLES.SR_STRATEGIC)) {
      return interaction.editReply({ content: 'You need to be at least **Senior Strategic Director** to set another member\'s RP name.', flags: MessageFlags.Ephemeral });
    }

    const rpName = interaction.options.getString('rpname');
    const old    = db.getRpName(target.id);
    db.saveRpName(target.id, rpName);
    db.logAction('setrpname', target.id, member.id, `${old ? `Changed from ${old}` : 'Set'} to ${rpName}`, null, null);

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('RP Name Updated')
          .setColor(0x5865f2)
          .addFields(
            { name: 'User', value: `<@${target.id}>`, inline: true },
            { name: 'RP Name', value: rpName, inline: true },
            { name: 'Updated By', value: `<@${member.id}>`, inline: true },
            ...(old ? [{ name: 'Previous Name', value: old, inline: true }] : []),
          )
          .setTimestamp()
      ],
      flags: MessageFlags.Ephemeral
    });
  }

  // ── /history ────────────────────────────────────────────────────
  if (commandName === 'history') {
    if (!hasOverride(member) && !hasAtLeast(member, ROLES.JR_FIELD_SUPERVISOR)) {
      return interaction.editReply({ content: 'You need to be at least **Junior Field Supervisor** to view history.', flags: MessageFlags.Ephemeral });
    }

    const target  = interaction.options.getUser('user');
    const records = db.getHistory(target.id, 20);

    if (!records.length) {
      return interaction.editReply({ content: `No action history found for <@${target.id}>.`, flags: MessageFlags.Ephemeral });
    }

    const TYPE_EMOJI = {
      warn: '[WARN]', strike: '[STRIKE]', demote: '[DEMOTE]', promote: '[PROMOTE]',
      terminate: '[TERMINATE]', investigate: '[INVESTIGATE]', clearinvestigation: '[CLEARED]',
      trainee: '[TRAINEE]', graduate: '[GRADUATE]',
    };

    const lines = records.map(r => {
      const prefix = TYPE_EMOJI[r.type] || '[ACTION]';
      const date  = `<t:${Math.floor(r.created_at / 1000)}:d>`;
      const extra = r.extra ? JSON.parse(r.extra) : {};
      let detail  = r.reason ? ` — ${r.reason.substring(0, 60)}` : '';
      if (r.type === 'promote' && extra.from && extra.to) detail = ` ${roleName(extra.from)} → ${roleName(extra.to)}`;
      if (r.type === 'demote'  && extra.from && extra.to) detail = ` ${roleName(extra.from)} → ${roleName(extra.to)}`;
      return `${prefix} ${date} by <@${r.executor_id}>${detail}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`Action History — ${target.username}`)
      .setColor(0x2f3136)
      .setDescription(lines.join('\n'))
      .setFooter({ text: `Last ${records.length} actions` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /activeinvestigations ────────────────────────────────────────
  if (commandName === 'activeinvestigations') {
    if (!hasOverride(member) && !hasAtLeast(member, ROLES.CMD_LIAISON)) {
      return interaction.editReply({ content: 'You need to be at least **Command Liaison Officer** to view investigations.', flags: MessageFlags.Ephemeral });
    }

    const all = db.getAllInvestigations();

    if (!all.length) {
      return interaction.editReply({ content: 'No active investigations.', flags: MessageFlags.Ephemeral });
    }

    const lines = all.map(inv => {
      const date = `<t:${Math.floor(inv.initiated_at / 1000)}:R>`;
      return `- <@${inv.user_id}> — initiated by <@${inv.initiated_by}> ${date}${inv.reason ? ` — ${inv.reason.substring(0, 60)}` : ''}`;    
    });

    const embed = new EmbedBuilder()
      .setTitle('Active Investigations')
      .setColor(0xf39c12)
      .setDescription(lines.join('\n'))
      .setFooter({ text: `${all.length} active` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  // ── /training ────────────────────────────────────────────────────
  if (commandName === 'training') {
    if (!member.roles.cache.has('1488519314716889163')) {
      return interaction.editReply({ content: 'You do not have permission to run this command.', flags: MessageFlags.Ephemeral });
    }

    const timestamp = interaction.options.getInteger('time');

    const trainingCh = guild.channels.cache.get('1492807397704470618') || await guild.channels.fetch('1492807397704470618').catch(() => null);
    if (!trainingCh) return interaction.editReply({ content: 'Training channel not found.', flags: MessageFlags.Ephemeral });

    // Pre-populate executor as instructor
    const instructing = new Set([member.id]);

    // Send with placeholder ID first, then immediately edit with the real message ID
    const placeholderContainer = buildTrainingContainer('PLACEHOLDER', timestamp, new Set(), instructing);
    const msg = await trainingCh.send({
      flags: MessageFlags.IsComponentsV2,
      components: [placeholderContainer],
      allowedMentions: { roles: ['1491020284554383492', '1488519314716889163'] },
    });

    const realContainer = buildTrainingContainer(msg.id, timestamp, new Set(), instructing);
    await msg.edit({ flags: MessageFlags.IsComponentsV2, components: [realContainer] });

    trainingRSVPs.set(msg.id, { timestamp, attending: new Set(), instructing, executorId: member.id });

    // Schedule the ping exactly when training begins
    const msUntilStart = (timestamp * 1000) - Date.now();
    if (msUntilStart > 0) {
      setTimeout(() => scheduleTrainingPing(client, msg.id), msUntilStart);
    }

    return interaction.editReply({ content: `Training announcement posted in <#1492807397704470618>!`, flags: MessageFlags.Ephemeral });
  }
});

// ──────────────────────────────────────────────────────────────────
//  Login
// ──────────────────────────────────────────────────────────────────

client.once(Events.ClientReady, c => {
  console.log(`Logged in as ${c.user.tag}`);

  // Check for expired timed strikes every minute
  setInterval(async () => {
    const expired = db.getExpiredStrikes();
    for (const row of expired) {
      db.deleteTimedStrike(row.user_id);
      try {
        const guild = c.guilds.cache.first();
        if (!guild) continue;
        const member = await guild.members.fetch(row.user_id).catch(() => null);
        if (!member) continue;
        await member.roles.remove(ROLES.STRIKE).catch(() => null);
        console.log(`Auto-removed strike from ${row.user_id}`);
      } catch (err) {
        console.error('Failed to auto-remove strike:', err);
      }
    }
  }, 60_000);
});

async function scheduleTrainingPing(client, msgId) {
  const rsvp = trainingRSVPs.get(msgId);
  if (!rsvp || rsvp.cancelled) return;
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    const trainingCh = guild.channels.cache.get('1492807397704470618')
      || await guild.channels.fetch('1492807397704470618').catch(() => null);
    if (!trainingCh) return;

    const allIds = [...rsvp.attending, ...rsvp.instructing];
    const pingText = allIds.length > 0
      ? `Training is starting now! ${allIds.map(id => `<@${id}>`).join(' ')}`
      : 'Training is starting now!';

    await trainingCh.send({
      content: pingText,
      allowedMentions: { users: allIds },
    });
  } catch (err) {
    console.error('Failed to send training start ping:', err);
  }
}

client.login(process.env.BOT_TOKEN);