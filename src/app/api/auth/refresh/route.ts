import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { tryRefreshTokens } from '@/lib/auth/refresh';

export async function POST() {
  const cookieStore = await cookies();
  const refreshed = await tryRefreshTokens(cookieStore);

  if (!refreshed) {
    clearAuthCookies(cookieStore);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
