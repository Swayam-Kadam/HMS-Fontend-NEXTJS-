import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_TOKEN_COOKIE } from '@/lib/auth/cookies';
import { tryRefreshTokens } from '@/lib/auth/refresh';

/**
 * Returns the current access token for Socket.IO handshake only.
 * Token stays httpOnly for normal API use; this endpoint is same-origin
 * and only called when opening a realtime connection.
 */
export async function GET() {
  const cookieStore = await cookies();
  let token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    await tryRefreshTokens(cookieStore);
    token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  }

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({ token });
}
