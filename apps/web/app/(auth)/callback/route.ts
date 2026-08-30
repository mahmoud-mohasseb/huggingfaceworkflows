import { NextResponse } from 'next/server';
import { ensureDatasetRepository } from '../../../lib/hfStorage';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, req.url));
  }

  let username = 'mahmoud-mohasseb';
  let accessToken = '';

  if (code) {
    try {
      const clientId = process.env.NEXT_PUBLIC_HF_CLIENT_ID || 'hf_oauth_app_client_id';
      const clientSecret = process.env.HF_CLIENT_SECRET || '';
      const redirectUri = `${url.origin}/callback`;

      // Exchange code for access token with Hugging Face OAuth token endpoint
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

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        accessToken = tokenData.access_token || '';

        // Fetch user profile info from Hugging Face OAuth userinfo endpoint
        const userinfoRes = await fetch('https://huggingface.co/oauth/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (userinfoRes.ok) {
          const userInfo = await userinfoRes.json();
          username = userInfo.preferred_username || userInfo.name || username;
        }
      }
    } catch (err) {
      console.warn('OAuth code exchange warning:', err);
    }
  }

  // Auto-provision datasets/{username}/hf-workflow-data
  try {
    await ensureDatasetRepository(username);
  } catch (e) {
    console.warn('Dataset repo provision warning:', e);
  }

  const response = NextResponse.redirect(new URL('/canvas/wf_telegram_ai_bot', req.url));
  if (accessToken) {
    response.cookies.set('hf_oauth_token', accessToken, { path: '/', httpOnly: false });
  }
  return response;
}
