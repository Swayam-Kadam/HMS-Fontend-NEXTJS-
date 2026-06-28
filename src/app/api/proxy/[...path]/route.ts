import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import conf from '@/conf/conf';
import {
  AUTH_TOKEN_COOKIE,
  clearAuthCookies,
} from '@/lib/auth/cookies';
import { tryRefreshTokens } from '@/lib/auth/refresh';

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  isRetry = false,
  bodyBuffer?: ArrayBuffer
) {
  const path = pathSegments.join('/');
  const search = request.nextUrl.search;
  const apiBase = conf.APIUrl.replace(/\/$/, '');
  const apiPath = path.endsWith('/') ? path : `${path}/`;
  const targetUrl = `${apiBase}/${apiPath}${search}`;

  const cookieStore = await cookies();
  let token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token && !isRetry) {
    await tryRefreshTokens(cookieStore);
    token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  }

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }

  if (token) {
    headers.set('auth-token', token);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  if (hasBody) {
    // Read the body once as an ArrayBuffer (not text) so binary payloads such as
    // multipart/form-data file uploads pass through without corruption, and so it
    // can be safely reused on the 401 refresh retry below.
    if (bodyBuffer === undefined) {
      bodyBuffer = await request.arrayBuffer();
    }
    init.body = bodyBuffer;
  }

  const backendRes = await fetch(targetUrl, init);
  const responseBody = await backendRes.text();

  if (backendRes.status === 401 && !isRetry) {
    const refreshed = await tryRefreshTokens(cookieStore);

    if (refreshed) {
      return proxyRequest(request, pathSegments, true, bodyBuffer);
    }

    clearAuthCookies(cookieStore);
  }

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: {
      'content-type':
        backendRes.headers.get('content-type') || 'application/json',
    },
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
