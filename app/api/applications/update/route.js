import { createClient } from 'redis';
import { NextResponse } from 'next/server';

let redis;
async function getRedis() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on('error', (err) => console.error('[Redis]', err));
    await redis.connect();
  }
  return redis;
}

export async function POST(request) {
  // Authenticate with shared secret so only the bot can call this
  const secret = request.headers.get('x-bot-secret');
  if (!secret || secret !== process.env.APP_STATUS_SECRET) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  const { appId, status, reviewerId, reviewerName } = body;
  if (!appId || !['accepted', 'denied'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const db  = await getRedis();
  const raw = await db.get(`app:${appId.toUpperCase()}`);
  if (!raw) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  }

  const data = JSON.parse(raw);
  const updated = {
    ...data,
    status,
    reviewedAt:   Date.now(),
    reviewedBy:   reviewerId  ?? null,
    reviewerName: reviewerName ?? null,
  };

  // Keep existing TTL — re-set with same key and 60-day TTL
  await db.set(`app:${appId.toUpperCase()}`, JSON.stringify(updated), { KEEPTTL: true });

  return NextResponse.json({ ok: true });
}
