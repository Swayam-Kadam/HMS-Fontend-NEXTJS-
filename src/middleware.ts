import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_REFRESH_COOKIE,
  AUTH_ROLE_COOKIE,
  AUTH_TOKEN_COOKIE,
} from '@/lib/auth/cookies';
import {
  AUTH_REDIRECT_ROUTES,
  getDefaultRedirect,
  isAdminRoute,
  isAuthRequiredRoute,
  isPublicRoute,
} from '@/conf/routes.config';
import type { UserRole } from '@/conf/routes.config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const refresh = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value as UserRole | undefined;
  const isAuthenticated = Boolean(token || (refresh && role));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const createResponse = () =>
    NextResponse.next({
      request: { headers: requestHeaders },
    });

  if (AUTH_REDIRECT_ROUTES.includes(pathname) && isAuthenticated) {
    const redirectPath = getDefaultRedirect(role ?? null);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isPublicRoute(pathname)) {
    return createResponse();
  }

  if (isAuthRequiredRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return createResponse();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
