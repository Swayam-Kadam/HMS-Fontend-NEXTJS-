import type { UserRole } from '@/conf/routes.config';
import {
  decryptPayload,
  encryptPayload,
  isEncryptedEnvelope,
  isPayloadEncryptionEnabled,
} from '@/lib/payloadCrypto';

export interface Session {
  authenticated: boolean;
  role: UserRole;
}

export async function fetchSession(): Promise<Session> {
  const res = await fetch('/api/auth/session', { credentials: 'include' });
  if (!res.ok) {
    return { authenticated: false, role: null };
  }
  return res.json();
}

export async function loginRequest(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data as { ok: true; role: UserRole };
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  cpassword: string;
}

export async function signupRequest(payload: SignupPayload) {
  const body = isPayloadEncryptionEnabled()
    ? await encryptPayload(payload)
    : payload;

  const res = await fetch('/api/proxy/auth/createuser/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(isPayloadEncryptionEnabled() ? { 'X-Payload-Encrypted': '1' } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  let data: Record<string, unknown> = await res.json().catch(() => ({}));
  if (isPayloadEncryptionEnabled() && isEncryptedEnvelope(data)) {
    data = (await decryptPayload(data)) as Record<string, unknown>;
  }

  if (!res.ok) {
    throw new Error(
      (data.error as string | undefined) ||
        (data.message as string | undefined) ||
        'Signup failed'
    );
  }

  return data;
}

export async function logoutRequest(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

export async function refreshSession(): Promise<boolean> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}
