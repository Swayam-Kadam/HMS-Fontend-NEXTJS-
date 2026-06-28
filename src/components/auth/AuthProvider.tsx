'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';
import SessionRefresh from './SessionRefresh';
import {
  isAuthRequiredRoute,
  isAdminRoute,
  AUTH_REDIRECT_ROUTES,
} from '@/conf/routes.config';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProviderInner: React.FC<AuthProviderProps> = ({ children }) => {
  const pathname = usePathname();

  const needsGuard =
    isAuthRequiredRoute(pathname) ||
    isAdminRoute(pathname) ||
    AUTH_REDIRECT_ROUTES.includes(pathname);

  return (
    <>
      <SessionRefresh />
      {needsGuard ? <ProtectedRoute>{children}</ProtectedRoute> : children}
    </>
  );
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => (
  <AuthProviderInner>{children}</AuthProviderInner>
);

export default AuthProvider;
