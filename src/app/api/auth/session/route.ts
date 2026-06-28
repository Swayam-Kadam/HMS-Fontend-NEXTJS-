import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from '@/lib/auth/cookies';
import { tryRefreshTokens } from '@/lib/auth/refresh';
import type { UserRole } from '@/conf/routes.config';

export async function GET() {
  const cookieStore = await cookies();
  let token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  let role = cookieStore.get(AUTH_ROLE_COOKIE)?.value as UserRole | undefined;

  if (!token) {
    const refreshed = await tryRefreshTokens(cookieStore);
    if (refreshed) {
      token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
      role = cookieStore.get(AUTH_ROLE_COOKIE)?.value as UserRole | undefined;
    }
  }

  return NextResponse.json({
    authenticated: Boolean(token),
    role: token ? (role ?? null) : null,
  });
}
