import { NextResponse } from 'next/server';
import { oauthTokenStore } from '../route.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const userId = searchParams.get('userId');

  if (secret !== process.env.TOKEN_FETCH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const token = oauthTokenStore.get(userId);
  if (!token) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Remove after retrieval so it's single-use
  oauthTokenStore.delete(userId);

  return NextResponse.json({ token });
}
