
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createCipheriv, randomBytes } from 'crypto';

function encryptToken(token) {
  const key = Buffer.from(process.env.TOKEN_FETCH_SECRET, 'utf8').subarray(0, 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${enc.toString('hex')}.${tag.toString('hex')}`;
}

// Discord component type constants
const C = { CONTAINER: 17, TEXT: 10, SEPARATOR: 14, ACTION_ROW: 1, BUTTON: 2 };
const SPACING_SMALL = 1;

export async function POST(request) {
  const cookieStore = await cookies();
  const raw = cookieStore.get('discord_user')?.value;
  if (!raw) {
    return NextResponse.json({ error: 'Not authenticated with Discord.' }, { status: 401 });
  }

  let discordUser;
  try {
    discordUser = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  const accessToken = discordUser.access_token ?? '';
  const encryptedToken = accessToken ? encryptToken(accessToken) : '';

  const body = await request.json();
  const { age, rank, experience, reason, additional } = body;

  const botToken   = process.env.DISCORD_BOT_TOKEN;
  const channelId  = process.env.APPLICATION_CHANNEL_ID;

  if (!botToken || !channelId) {
    return NextResponse.json({ error: 'Bot not configured.' }, { status: 500 });
  }

  const displayName = discordUser.global_name || discordUser.username;
  const userId      = discordUser.id;

  // Build Components V2 message
  const components = [
    {
      type:         C.CONTAINER,
      accent_color: 0xc9a228,
      components: [
        {
          type:    C.TEXT,
          content: `## BOI Application`,
        },
        {
          type:    C.TEXT,
          content: `**Applicant:** <@${userId}> (${displayName})\n**Discord ID:** \`${userId}\``,
        },
        { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
        {
          type:    C.TEXT,
          content: `**Age:** ${age || 'N/A'}\n**Current Rank / Role:** ${rank || 'N/A'}`,
        },
        { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
        {
          type:    C.TEXT,
          content: `**Operational Experience**\n${experience || 'N/A'}`,
        },
        { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
        {
          type:    C.TEXT,
          content: `**Why do you want to join?**\n${reason || 'N/A'}`,
        },
        ...(additional?.trim()
          ? [
              { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
              { type: C.TEXT, content: `**Additional Information**\n${additional}` },
            ]
          : []),
        { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
        // HIDDEN ENCRYPTED TOKEN COMPONENT
        encryptedToken && {
          type: C.TEXT,
          content: `-# oauth:${encryptedToken}`,
        },
        {
          type: C.ACTION_ROW,
          components: [
            {
              type:      C.BUTTON,
              style:     3, // Success (green)
              label:     'Accept',
              custom_id: `app_accept:${userId}`,
            },
            {
              type:      C.BUTTON,
              style:     4, // Danger (red)
              label:     'Deny',
              custom_id: `app_deny:${userId}`,
            },
          ],
        },
      ].filter(Boolean),
    },
  ];

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bot ${botToken}`,
    },
    body: JSON.stringify({
      flags:      1 << 15, // IS_COMPONENTS_V2
      components,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Discord REST error:', err);
    return NextResponse.json({ error: 'Failed to send application.' }, { status: 502 });
  }

  // Store token server-side so the bot can retrieve it; never goes in the message
  if (accessToken) oauthTokenStore.set(userId, accessToken);

  return NextResponse.json({ ok: true });
}

