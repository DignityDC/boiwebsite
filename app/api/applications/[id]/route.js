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
  const { id } = await params;
  if (!id || !/^[A-F0-9]{8}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid application ID.' }, { status: 400 });
  }

  const db  = await getRedis();
  const raw = await db.get(`app:${id.toUpperCase()}`);
  if (!raw) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  }

  const data = JSON.parse(raw);
  // Never expose internal fields like the userId beyond what's needed for display
  return NextResponse.json({
    appId:        data.appId,
    status:       data.status,
    submittedAt:  data.submittedAt,
    reviewedAt:   data.reviewedAt,
    reviewerName: data.reviewerName,
  });
}
