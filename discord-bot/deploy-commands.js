require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('trainee')
    .setDescription('Assign the Agent in Training role to a user')
    .addUserOption(o => o.setName('user').setDescription('The user to assign').setRequired(true))
    .addStringOption(o => o.setName('rpname').setDescription('Their RP name e.g. D. Dignity').setRequired(true))
    .addStringOption(o => o.setName('timezone').setDescription('Their timezone e.g. GMT, EST, PST').setRequired(false)),

  new SlashCommandBuilder()
    .setName('graduate')
    .setDescription('Graduate a trainee to Field Agent (removes trainee role)')
    .addUserOption(o => o.setName('user').setDescription('The trainee to graduate').setRequired(true)),

  new SlashCommandBuilder()
    .setName('promote')
    .setDescription('Promote a user one rank up')
    .addUserOption(o => o.setName('user').setDescription('User to promote').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for promotion').setRequired(false))
    .addUserOption(o => o.setName('approvedby').setDescription('Approved by (defaults to you)').setRequired(false)),

  new SlashCommandBuilder()
    .setName('demote')
    .setDescription('Demote a user one rank down')
    .addUserOption(o => o.setName('user').setDescription('User to demote').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for demotion').setRequired(true))
    .addStringOption(o => o.setName('evidence').setDescription('Evidence link or description').setRequired(false)),

  new SlashCommandBuilder()
    .setName('terminate')
    .setDescription('Kick a user from the server')
    .addUserOption(o => o.setName('user').setDescription('User to terminate').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for termination').setRequired(true))
    .addStringOption(o => o.setName('evidence').setDescription('Evidence link or description').setRequired(false)),

  new SlashCommandBuilder()
    .setName('investigate')
    .setDescription('Strip all roles and apply Under Investigation role')
    .addUserOption(o => o.setName('user').setDescription('User to investigate').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for investigation').setRequired(true))
    .addStringOption(o => o.setName('evidence').setDescription('Evidence link or description').setRequired(false)),

  new SlashCommandBuilder()
    .setName('clearinvestigation')
    .setDescription('Clear an investigation and restore the user\'s roles')
    .addUserOption(o => o.setName('user').setDescription('User to clear').setRequired(true)),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for warning').setRequired(true))
    .addStringOption(o => o.setName('evidence').setDescription('Evidence link or description').setRequired(false)),

  new SlashCommandBuilder()
    .setName('strike')
    .setDescription('Give a user a strike')
    .addUserOption(o => o.setName('user').setDescription('User to strike').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for strike').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('How long e.g. 30m, 1h, 2d, 1w (leave blank = permanent)').setRequired(false))
    .addStringOption(o => o.setName('evidence').setDescription('Evidence link or description').setRequired(false)),

  new SlashCommandBuilder()
    .setName('removestrike')
    .setDescription('Remove the strike role from a user')
    .addUserOption(o => o.setName('user').setDescription('User to remove strike from').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason (optional)').setRequired(false)),

  new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('View a user\'s current rank, strike, and investigation status')
    .addUserOption(o => o.setName('user').setDescription('User to look up').setRequired(true)),

  new SlashCommandBuilder()
    .setName('setrpname')
    .setDescription('Set or update a user\'s RP name')
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(true))
    .addStringOption(o => o.setName('rpname').setDescription('Their RP name e.g. D. Dignity').setRequired(true)),

  new SlashCommandBuilder()
    .setName('appeal')
    .setDescription('Appeal one of your punishments')
    .addStringOption(o => o.setName('reason').setDescription('Your appeal statement').setRequired(true)),

  new SlashCommandBuilder()
    .setName('history')
    .setDescription('View action history for a user')
    .addUserOption(o => o.setName('user').setDescription('User to look up').setRequired(true)),

  new SlashCommandBuilder()
    .setName('activeinvestigations')
    .setDescription('List all users currently under investigation'),

  new SlashCommandBuilder()
    .setName('training')
    .setDescription('Announce a BOI training session')
    .addIntegerOption(o => o.setName('time').setDescription('Unix timestamp for when training begins').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Deploying slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Commands deployed successfully.');
  } catch (err) {
    console.error(err);
  }
})();
