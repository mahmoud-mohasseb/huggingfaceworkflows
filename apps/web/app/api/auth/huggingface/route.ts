import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const clientId = process.env.HF_CLIENT_ID || 'demo_client_id';
  const redirectUri = process.env.HF_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/huggingface/callback';
  const scope = 'openid profile inference-api write-discussions read-repos write-repos';
  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = `https://huggingface.co/oauth/authorize?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
