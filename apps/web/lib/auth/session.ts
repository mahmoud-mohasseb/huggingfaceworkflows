import { cookies } from 'next/headers';
import { saveHFToken } from './tokenStore';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  provider: 'huggingface';
  hfToken?: string;
}

const SESSION_COOKIE_NAME = 'hf_session_token';
const HF_OAUTH_COOKIE = 'hf_oauth_token';

export async function getSessionUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get(HF_OAUTH_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const res = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: { Authorization: `Bearer ${sessionToken}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      id: data.id || data.name,
      username: data.name || data.preferred_username || 'hf_user',
      email: data.email,
      avatarUrl: data.avatarUrl || data.avatar_url,
      provider: 'huggingface',
      hfToken: sessionToken,
    };
  } catch (err) {
    return null;
  }
}

export function setSessionCookies(token: string) {
  saveHFToken(token);
  const cookieStore = cookies();
  const isProd = process.env.NODE_ENV === 'production';

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  cookieStore.set(HF_OAUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookies() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(HF_OAUTH_COOKIE);
}
