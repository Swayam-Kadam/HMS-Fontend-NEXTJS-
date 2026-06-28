import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import conf from '@/conf/conf';
import { AUTH_REFRESH_COOKIE, clearAuthCookies } from '@/lib/auth/cookies';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_REFRESH_COOKIE)?.value;

  if (refreshToken) {
    const apiBase = conf.APIUrl.replace(/\/$/, '');
    try {
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort revocation; still clear cookies locally.
    }
  }

  clearAuthCookies(cookieStore);
  return NextResponse.json({ ok: true });
}
