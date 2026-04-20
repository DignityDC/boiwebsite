import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('discord_user')?.value;

  if (!raw) return NextResponse.json({ user: null });

  try {
    const user = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('discord_user', '', { maxAge: 0, path: '/' });
  return response;
}
