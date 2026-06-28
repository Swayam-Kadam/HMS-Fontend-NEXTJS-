import type { UserRole } from '@/conf/routes.config';

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
