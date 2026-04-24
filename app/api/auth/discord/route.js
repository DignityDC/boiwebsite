import { redirect } from 'next/navigation';

export async function GET() {
  const clientId    = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'identify guilds.join',
  });

  redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
}
