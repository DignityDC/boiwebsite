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

export async function GET(request, { params }) {
  const { id } = params;
  if (!/^[A-F0-9]{10}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid transcript ID.' }, { status: 400 });
  }

  const db  = await getRedis();
  const raw = await db.get(`transcript:${id.toUpperCase()}`);
  if (!raw) {
    return NextResponse.json({ error: 'Transcript not found or has expired.' }, { status: 404 });
  }

  return NextResponse.json(JSON.parse(raw));
}
