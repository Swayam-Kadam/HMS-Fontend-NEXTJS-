import conf from '@/conf/conf';
import {
  AUTH_REFRESH_COOKIE,
  AUTH_ROLE_COOKIE,
  setAuthCookies,
  type AuthCookieStore,
} from '@/lib/auth/cookies';

export async function tryRefreshTokens(
  cookieStore: AuthCookieStore
): Promise<boolean> {
  const refreshToken = cookieStore.get?.(AUTH_REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return false;
  }

  const role = cookieStore.get?.(AUTH_ROLE_COOKIE)?.value ?? 'user';
  const apiBase = conf.APIUrl.replace(/\/$/, '');

  const backendRes = await fetch(`${apiBase}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await backendRes.json().catch(() => ({}));
  const payload = data?.data ?? data;
  const token = payload?.authtoken ?? payload?.token ?? data?.authtoken;
  const newRefresh =
    payload?.refreshToken ?? payload?.refresh ?? data?.refreshToken ?? data?.refresh;

  if (!backendRes.ok || !token) {
    return false;
  }

  setAuthCookies(cookieStore, {
    token,
    role,
    refresh: newRefresh ?? refreshToken,
  });

  return true;
}
