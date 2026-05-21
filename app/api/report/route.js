import { NextResponse } from 'next/server';

const REPORT_CHANNEL_ID = '1507066659234643988';
const BOI_GUILD_ID      = process.env.BOI_GUILD_ID;

export async function POST(request) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !BOI_GUILD_ID) {
    return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
  }

  let reporterName, reportedId, reason, evidence, additional, imageFiles;
  try {
    const fd = await request.formData();
    reporterName = fd.get('reporterName') ?? '';
    reportedId   = fd.get('reportedId')   ?? '';
    reason       = fd.get('reason')       ?? '';
    evidence     = fd.get('evidence')     ?? '';
    additional   = fd.get('additional')   ?? '';
    imageFiles   = fd.getAll('images');   // File objects or empty array
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Basic validation
  if (!reportedId || !/^\d{17,19}$/.test(reportedId)) {
    return NextResponse.json({ error: 'Invalid Discord ID. Must be 17–19 digits.' }, { status: 400 });
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: 'Reason is required.' }, { status: 400 });
  }
  if (!evidence?.trim()) {
    return NextResponse.json({ error: 'Evidence is required.' }, { status: 400 });
  }

  const headers = {
    'Content-Type':  'application/json',
    'Authorization': `Bot ${botToken}`,
  };

  // Check if the reported user is actually in the BOI guild
  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${BOI_GUILD_ID}/members/${reportedId}`,
    { headers }
  );

  if (memberRes.status === 404 || memberRes.status === 403) {
    return NextResponse.json(
      { error: "This person wasn't found in the BOI Discord. This form is only for reporting BOI agents." },
      { status: 404 }
    );
  }
  if (!memberRes.ok) {
    return NextResponse.json({ error: 'Failed to verify agent in BOI Discord. Please try again.' }, { status: 502 });
  }

  const memberData   = await memberRes.json();
  const reportedTag  = memberData.user?.username ?? reportedId;
  const reportedNick = memberData.nick || memberData.user?.global_name || reportedTag;
  const reporterDisplay = reporterName?.trim() || 'Anonymous';

  const embed = {
    title:  'New Agent Report',
    color:  0xc9a228,
    fields: [
      { name: 'Reported By',    value: reporterDisplay,                     inline: true  },
      { name: 'Reported Agent', value: `<@${reportedId}> (${reportedNick})`, inline: true  },
      { name: 'Reason',         value: reason.trim().slice(0, 1024),         inline: false },
      { name: 'Evidence',       value: evidence.trim().slice(0, 1024),       inline: false },
      ...(additional?.trim()
        ? [{ name: 'Additional Information', value: additional.trim().slice(0, 1024), inline: false }]
        : []),
    ],
    footer:    { text: `Reported Agent ID: ${reportedId}` },
    timestamp: new Date().toISOString(),
  };

  const button = {
    type: 1,
    components: [{
      type:      2,
      style:     4,
      label:     'Open Ticket',
      custom_id: `report_open_ticket:${reportedId}`,
    }],
  };

  // Filter to valid image files (guard against empty File entries)
  const validImages = imageFiles.filter(
    (f) => f instanceof File && f.size > 0 && f.type.startsWith('image/')
  );

  let msgRes;
  if (validImages.length > 0) {
    // Send as multipart/form-data so Discord accepts file attachments
    const discordFd = new FormData();
    discordFd.append('payload_json', JSON.stringify({
      embeds:     [embed],
      components: [button],
    }));
    validImages.forEach((img, i) => {
      discordFd.append(`files[${i}]`, img, img.name);
    });

    msgRes = await fetch(
      `https://discord.com/api/v10/channels/${REPORT_CHANNEL_ID}/messages`,
      {
        method:  'POST',
        headers: { Authorization: `Bot ${botToken}` }, // no Content-Type — let fetch set boundary
        body:    discordFd,
      }
    );
  } else {
    // No attachments — plain JSON
    msgRes = await fetch(
      `https://discord.com/api/v10/channels/${REPORT_CHANNEL_ID}/messages`,
      {
        method:  'POST',
        headers,
        body:    JSON.stringify({ embeds: [embed], components: [button] }),
      }
    );
  }

  if (!msgRes.ok) {
    const err = await msgRes.text();
    console.error('Discord report channel error:', err);
    return NextResponse.json({ error: 'Failed to submit report.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !BOI_GUILD_ID) {
    return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { reporterName = '', reportedId, reason, evidence, additional = '' } = body;

  // Basic validation
  if (!reportedId || !/^\d{17,19}$/.test(reportedId)) {
    return NextResponse.json({ error: 'Invalid Discord ID. Must be 17–19 digits.' }, { status: 400 });
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: 'Reason is required.' }, { status: 400 });
  }
  if (!evidence?.trim()) {
    return NextResponse.json({ error: 'Evidence is required.' }, { status: 400 });
  }

  const headers = {
    'Content-Type':  'application/json',
    'Authorization': `Bot ${botToken}`,
  };

  // Check if the reported user is actually in the BOI guild
  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${BOI_GUILD_ID}/members/${reportedId}`,
    { headers }
  );

  if (memberRes.status === 404 || memberRes.status === 403) {
    return NextResponse.json(
      { error: "This person wasn't found in the BOI Discord. This form is only for reporting BOI agents." },
      { status: 404 }
    );
  }
  if (!memberRes.ok) {
    return NextResponse.json({ error: 'Failed to verify agent in BOI Discord. Please try again.' }, { status: 502 });
  }

  const memberData = await memberRes.json();
  const reportedTag = memberData.user?.username ?? reportedId;
  const reportedNick = memberData.nick || memberData.user?.global_name || reportedTag;

  // Build the embed for the report intake channel
  const reporterDisplay = reporterName?.trim() || 'Anonymous';

  const embed = {
    title:       'New Agent Report',
    color:       0xc9a228,
    fields: [
      {
        name:   'Reported By',
        value:  reporterDisplay,
        inline: true,
      },
      {
        name:   'Reported Agent',
        value:  `<@${reportedId}> (${reportedNick})`,
        inline: true,
      },
      {
        name:   'Reason',
        value:  reason.trim().slice(0, 1024),
        inline: false,
      },
      {
        name:   'Evidence',
        value:  evidence.trim().slice(0, 1024),
        inline: false,
      },
      ...(additional?.trim()
        ? [{ name: 'Additional Information', value: additional.trim().slice(0, 1024), inline: false }]
        : []),
    ],
    footer: { text: `Reported Agent ID: ${reportedId}` },
    timestamp: new Date().toISOString(),
  };

  const msgRes = await fetch(
    `https://discord.com/api/v10/channels/${REPORT_CHANNEL_ID}/messages`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        embeds:     [embed],
        components: [
          {
            type: 1, // ACTION_ROW
            components: [
              {
                type:      2, // BUTTON
                style:     4, // Danger (red)
                label:     'Open Ticket',
                custom_id: `report_open_ticket:${reportedId}`,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!msgRes.ok) {
    const err = await msgRes.text();
    console.error('Discord report channel error:', err);
    return NextResponse.json({ error: 'Failed to submit report.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
