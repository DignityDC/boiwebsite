import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/#apply', process.env.NEXT_PUBLIC_BASE_URL));
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.DISCORD_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/#apply', process.env.NEXT_PUBLIC_BASE_URL));
  }

  const tokenData = await tokenRes.json();

  // Fetch the user's Discord profile
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL('/#apply', process.env.NEXT_PUBLIC_BASE_URL));
  }

  const user = await userRes.json();

  // Store user info + access token in a cookie
  const payload = JSON.stringify({ id: user.id, username: user.username, global_name: user.global_name, access_token: tokenData.access_token });
  const encoded = Buffer.from(payload).toString('base64');

  const response = NextResponse.redirect(new URL('/#apply', process.env.NEXT_PUBLIC_BASE_URL));
  response.cookies.set('discord_user', encoded, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 2, // 2 hours
    path:     '/',
  });

  return response;
}
