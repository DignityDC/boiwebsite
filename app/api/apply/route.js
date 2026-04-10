import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const { username, discordId, age, rank, experience, reason, additional } = body;

  const embed = {
    title: 'New BOI Application',
    color: 0xc9a228,
    fields: [
      { name: 'Username',           value: username    || 'N/A', inline: true  },
      { name: 'Discord ID',         value: discordId   || 'N/A', inline: true  },
      { name: 'Age',                value: age         || 'N/A', inline: true  },
      { name: 'Current Rank / Role',value: rank        || 'N/A', inline: true },
      { name: 'Operational Experience', value: experience || 'N/A', inline: false },
      { name: 'Reason for Applying',    value: reason     || 'N/A', inline: false },
      ...(additional?.trim()
        ? [{ name: 'Additional Info', value: additional, inline: false }]
        : []),
    ],
    footer: {
      text: 'BOI Recruitment System // FORM-001',
    },
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to send to Discord' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
