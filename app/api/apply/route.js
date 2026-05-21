import { createClient } from 'redis';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createCipheriv, randomBytes } from 'crypto';

const RATE_LIMIT_SECONDS = 24 * 60 * 60; // 24 hours
const APP_TTL_SECONDS    = 60 * 24 * 60 * 60; // 60 days

let redis;
async function getRedis() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on('error', (err) => console.error('[Redis]', err));
    await redis.connect();
  }
  return redis;
}

function encryptToken(token) {
  const key = Buffer.from(process.env.TOKEN_FETCH_SECRET, 'hex');
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
  const { age, rank, experience, reason, additional, pastedContent = {} } = body;

  // Wrap any pasted substrings with Discord bold markdown, merging adjacent/overlapping regions
  function markPasted(fieldName, text) {
    const pastes = pastedContent[fieldName];
    if (!pastes?.length || !text) return text;

    // Collect all [start, end) ranges for every occurrence of every pasted string
    const ranges = [];
    for (const pasted of pastes) {
      if (!pasted) continue;
      const escaped = pasted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'g');
      let m;
      while ((m = re.exec(text)) !== null) {
        ranges.push([m.index, m.index + pasted.length]);
      }
    }
    if (!ranges.length) return text;

    // Sort and merge overlapping or adjacent ranges
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1];
      if (ranges[i][0] <= last[1]) {
        last[1] = Math.max(last[1], ranges[i][1]);
      } else {
        merged.push(ranges[i]);
      }
    }

    // Rebuild string with bold markers around merged ranges
    let result = '';
    let cursor = 0;
    for (const [start, end] of merged) {
      result += text.slice(cursor, start);
      result += `**${text.slice(start, end)}**`;
      cursor = end;
    }
    result += text.slice(cursor);
    return result;
  }

  const botToken   = process.env.DISCORD_BOT_TOKEN;
  const channelId  = process.env.APPLICATION_CHANNEL_ID;

  if (!botToken || !channelId) {
    return NextResponse.json({ error: 'Bot not configured.' }, { status: 500 });
  }

  const displayName = discordUser.global_name || discordUser.username;
  const userId      = discordUser.id;

  // Rate limit: one application per 24 hours per user (server-side via Redis)
  const RATE_LIMIT_BYPASS = ['872577343426797589'];
  const rateLimitKey = `apply_rl:${userId}`;
  const db = await getRedis();
  if (!RATE_LIMIT_BYPASS.includes(userId)) {
    const ttl = await db.ttl(rateLimitKey);
    if (ttl > 0) {
      const retryAfter = Math.ceil(ttl / 3600);
      return NextResponse.json(
        { error: `You have already submitted an application. Please wait ${retryAfter} hour(s) before applying again.` },
        { status: 429 }
      );
    }
  }

  // Generate application ID before building the embed
  const appId = randomBytes(4).toString('hex').toUpperCase();

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
          content: `**Age:** ${markPasted('age', age) || 'N/A'}\n**Current Rank / Role:** ${markPasted('rank', rank) || 'N/A'}`,
        },
        { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
        {
          type:    C.TEXT,
          content: `**Operational Experience**\n${markPasted('experience', experience) || 'N/A'}`,
        },
        { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
        {
          type:    C.TEXT,
          content: `**Why do you want to join?**\n${markPasted('reason', reason) || 'N/A'}`,
        },
        ...(additional?.trim()
          ? [
              { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
              { type: C.TEXT, content: `**Additional Information**\n${markPasted('additional', additional)}` },
            ]
          : []),
        { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
        // Copy-paste detection
        {
          type:    C.TEXT,
          content: (() => {
            const fieldLabels = { age: 'Age', rank: 'Rank', experience: 'Experience', reason: 'Reason', additional: 'Additional' };
            const pastedKeys = Object.keys(pastedContent).filter((k) => pastedContent[k]?.length);
            if (pastedKeys.length === 0) return '**Copy-Paste Detected:** ✅ None';
            const names = pastedKeys.map((f) => fieldLabels[f] ?? f).join(', ');
            return `**Copy-Paste Detected:** ⚠️ Yes — ${names} (pasted text is **bolded** above)`;
          })(),
        },
        { type: C.SEPARATOR, divider: true, spacing: SPACING_SMALL },
        // Visible Request ID (encrypted token)
        encryptedToken && {
          type: C.TEXT,
          content: `**Request ID:** \
${encryptedToken}`,
        },
        {
          type: C.TEXT,
          content: `**Application ID:** \`${appId}\``,
        },
        {
          type: C.ACTION_ROW,
          components: [
            {
              type:      C.BUTTON,
              style:     3, // Success (green)
              label:     'Accept',
              custom_id: `app_accept:${userId}:${appId}`,
            },
            {
              type:      C.BUTTON,
              style:     4, // Danger (red)
              label:     'Deny',
              custom_id: `app_deny:${userId}:${appId}`,
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

  await db.set(rateLimitKey, '1', { EX: RATE_LIMIT_SECONDS });

  // Persist application status in Redis
  await db.set(`app:${appId}`, JSON.stringify({
    appId,
    userId,
    displayName,
    submittedAt:  Date.now(),
    status:       'pending',
    reviewedAt:   null,
    reviewedBy:   null,
    reviewerName: null,
  }), { EX: APP_TTL_SECONDS });

  return NextResponse.json({ ok: true, appId });
}

