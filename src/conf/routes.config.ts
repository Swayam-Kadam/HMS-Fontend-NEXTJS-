export type UserRole = 'user' | 'admin' | null;

export const PUBLIC_ROUTES = [
  '/',
  '/details',
  '/donation',
  '/contact-us',
  '/login',
  '/signup',
  '/forgot-password',
  '/success',
  '/unsuccess',
];

export const AUTH_REQUIRED_ROUTES = ['/appointment', '/profile'];

export const AUTH_REDIRECT_ROUTES = ['/login', '/signup'];

export const ADMIN_ROUTES = [
  '/dashboard',
  '/add-doctor',
  '/manage-appointment',
  '/user-messages',
  '/contact-messages',
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

export const requiresAuth = (path: string): boolean =>
  isAuthRequiredRoute(path) || isAdminRoute(path);
