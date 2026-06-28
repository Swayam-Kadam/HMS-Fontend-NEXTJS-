import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const AUTH_TOKEN_COOKIE = 'hms_token';
export const AUTH_ROLE_COOKIE = 'hms_role';
export const AUTH_REFRESH_COOKIE = 'hms_refresh';

const FIFTEEN_MINUTES = 60 * 15;
const SEVEN_DAYS = 60 * 60 * 24 * 7;

export function getAuthCookieOptions(maxAge = SEVEN_DAYS): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export interface AuthCookieStore {
  get?: (name: string) => { value: string } | undefined;
  set: (name: string, value: string, options?: Partial<ResponseCookie>) => void;
  delete: (name: string) => void;
}

export function setAuthCookies(
  cookieStore: AuthCookieStore,
  { token, role, refresh }: { token: string; role: string; refresh?: string }
) {
  cookieStore.set(AUTH_TOKEN_COOKIE, token, getAuthCookieOptions(FIFTEEN_MINUTES));
  cookieStore.set(AUTH_ROLE_COOKIE, role, getAuthCookieOptions(SEVEN_DAYS));

  if (refresh) {
    cookieStore.set(AUTH_REFRESH_COOKIE, refresh, getAuthCookieOptions(SEVEN_DAYS));
  }
}

export function clearAuthCookies(cookieStore: AuthCookieStore) {
  cookieStore.delete(AUTH_TOKEN_COOKIE);
  cookieStore.delete(AUTH_ROLE_COOKIE);
  cookieStore.delete(AUTH_REFRESH_COOKIE);
}
