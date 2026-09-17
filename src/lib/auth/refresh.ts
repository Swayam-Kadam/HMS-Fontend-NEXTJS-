import conf from '@/conf/conf';
import {
  AUTH_REFRESH_COOKIE,
  AUTH_ROLE_COOKIE,
  setAuthCookies,
  type AuthCookieStore,
} from '@/lib/auth/cookies';
import {
  decryptPayload,
  encryptPayload,
  isEncryptedEnvelope,
  isPayloadEncryptionEnabled,
} from '@/lib/server/payloadCrypto';

export async function tryRefreshTokens(
  cookieStore: AuthCookieStore
): Promise<boolean> {
  const refreshToken = cookieStore.get?.(AUTH_REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return false;
  }

  const role = cookieStore.get?.(AUTH_ROLE_COOKIE)?.value ?? 'user';
  const apiBase = conf.APIUrl.replace(/\/$/, '');

  const requestBody = isPayloadEncryptionEnabled()
    ? encryptPayload({ refreshToken })
    : { refreshToken };

  const backendRes = await fetch(`${apiBase}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  let data: Record<string, unknown> = await backendRes.json().catch(() => ({}));
  if (isPayloadEncryptionEnabled() && isEncryptedEnvelope(data)) {
    data = decryptPayload(data) as Record<string, unknown>;
  }

  const payload = (data?.data ?? data) as Record<string, unknown>;
  const token =
    (payload?.authtoken as string | undefined) ??
    (payload?.token as string | undefined) ??
    (data?.authtoken as string | undefined);
  const newRefresh =
    (payload?.refreshToken as string | undefined) ??
    (payload?.refresh as string | undefined) ??
    (data?.refreshToken as string | undefined) ??
    (data?.refresh as string | undefined);

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
