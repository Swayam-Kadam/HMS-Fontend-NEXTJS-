export type UserRole = 'user' | 'admin' | null;

export const PUBLIC_ROUTES = [
  '/',
  '/doctors',
  '/details',
  '/donation',
  '/contact-us',
  '/login',
  '/signup',
  '/authorize',
  '/terms',
  '/privacy',
  '/success',
  '/unsuccess',
];

export const AUTH_REQUIRED_ROUTES = ['/appointment', '/profile', '/support'];

export const AUTH_REDIRECT_ROUTES = ['/login', '/signup'];

export const ADMIN_ROUTES = [
  '/dashboard',
  '/add-doctor',
  '/manage-doctor',
  '/manage-user',
  '/manage-appointment',
  '/user-messages',
  '/contact-messages',
  '/support-inbox',
];

export const isPublicRoute = (path: string): boolean =>
  PUBLIC_ROUTES.includes(path);

export const isAuthRequiredRoute = (path: string): boolean =>
  AUTH_REQUIRED_ROUTES.includes(path);

export const isAdminRoute = (path: string): boolean =>
  ADMIN_ROUTES.includes(path) || path.startsWith('/admin');

export const isRouteAccessible = (path: string, role: UserRole): boolean => {
  if (isPublicRoute(path)) {
    return true;
  }

  if (isAuthRequiredRoute(path)) {
    return role === 'user' || role === 'admin';
  }

  if (isAdminRoute(path)) {
    return role === 'admin';
  }

  return true;
};

export const getDefaultRedirect = (role: UserRole): string => {
  if (role === 'admin') {
    return '/dashboard';
  }
  return '/';
};

const isAuthPagePath = (path: string): boolean =>
  path === '/login' ||
  path.startsWith('/login?') ||
  path === '/signup' ||
  path.startsWith('/signup?') ||
  path === '/authorize' ||
  path.startsWith('/authorize?');

/**
 * Prefer `redirect` query when it is a safe same-origin path for this role.
 * Admins are not sent to patient routes (/profile, /support, …).
 * Users are not sent to admin routes.
 */
export const getSafeRedirect = (
  redirect: string | null | undefined,
  role: UserRole
): string => {
  const fallback = getDefaultRedirect(role);

  if (
    !redirect ||
    !redirect.startsWith('/') ||
    redirect.startsWith('//') ||
    isAuthPagePath(redirect)
  ) {
    return fallback;
  }

  if (role === 'admin') {
    if (isAdminRoute(redirect)) {
      return redirect;
    }
    // Ignore patient deep-links for admins (e.g. ?redirect=/profile).
    return fallback;
  }

  if (role === 'user' && isAdminRoute(redirect)) {
    return fallback;
  }

  return redirect;
};

export const requiresAuth = (path: string): boolean =>
  isAuthRequiredRoute(path) || isAdminRoute(path);
