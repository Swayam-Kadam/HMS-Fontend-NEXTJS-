import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import conf from '@/conf/conf';
import { setAuthCookies } from '@/lib/auth/cookies';
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

    const backendRes = await fetch(`${conf.APIUrl}${LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendRes.json().catch(() => ({}));
    const payload = data?.data ?? data;
    const token = payload?.authtoken ?? payload?.token ?? data?.authtoken;
    const role = payload?.role ?? data?.role;

    if (!backendRes.ok || !token || !role) {
      return NextResponse.json(
        { error: data?.error || data?.message || 'Login failed' },
        { status: backendRes.status || 401 }
      );
    }

    const cookieStore = await cookies();
    setAuthCookies(cookieStore, {
      token,
      role,
      refresh:
        payload?.refreshToken ??
        payload?.refresh ??
        data?.refreshToken ??
        data?.refresh,
    });

    return NextResponse.json({ ok: true, role });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
