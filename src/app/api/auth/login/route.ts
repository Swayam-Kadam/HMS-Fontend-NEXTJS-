import { NextRequest, NextResponse } from 'next/server';
import conf from '@/conf/conf';
import { setAuthCookies } from '@/lib/auth/cookies';
import {
  decryptPayload,
  encryptPayload,
  isEncryptedEnvelope,
  isPayloadEncryptionEnabled,
} from '@/lib/server/payloadCrypto';
import { LOGIN } from '@/services/url';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const requestBody = isPayloadEncryptionEnabled()
      ? encryptPayload({ email, password })
      : { email, password };

    const backendRes = await fetch(`${conf.APIUrl}${LOGIN}`, {
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
    const role =
      (payload?.role as string | undefined) ?? (data?.role as string | undefined);

    if (!backendRes.ok || !token || !role) {
      return NextResponse.json(
        {
          error:
            (data?.error as string | undefined) ||
            (data?.message as string | undefined) ||
            'Login failed',
        },
        { status: backendRes.status || 401 }
      );
    }

    const res = NextResponse.json({ ok: true, role });
    setAuthCookies(res.cookies, {
      token,
      role,
      refresh:
        (payload?.refreshToken as string | undefined) ??
        (payload?.refresh as string | undefined) ??
        (data?.refreshToken as string | undefined) ??
        (data?.refresh as string | undefined),
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
