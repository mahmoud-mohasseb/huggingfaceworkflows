import { NextResponse } from 'next/server';
import { setSessionCookies } from '../../../../../lib/auth/session';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=oauth_cancelled', req.url));
  }

  try {
    const clientId = process.env.HF_CLIENT_ID || '';
    const clientSecret = process.env.HF_CLIENT_SECRET || '';
    const redirectUri = process.env.HF_OAUTH_REDIRECT_URI || `${url.origin}/api/auth/huggingface/callback`;

    const tokenRes = await fetch('https://huggingface.co/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', req.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL('/login?error=no_access_token', req.url));
    }

    setSessionCookies(accessToken);
    return NextResponse.redirect(new URL('/canvas/wf_telegram_ai_bot', req.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, req.url));
  }
}
