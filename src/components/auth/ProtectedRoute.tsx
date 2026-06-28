'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchSession } from '@/utils/auth';
import {
  isRouteAccessible,
  getDefaultRedirect,
  AUTH_REDIRECT_ROUTES,
} from '@/conf/routes.config';
import type { UserRole } from '@/conf/routes.config';
import {
  AuthSessionProvider,
  type AuthSessionState,
} from '@/context/AuthSessionContext';
import {
  resetSessionGate,
  resolveSessionGate,
} from '@/lib/auth/sessionGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const initialSessionState: AuthSessionState = {
  sessionReady: false,
  authenticated: false,
  role: null,
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [verifiedPath, setVerifiedPath] = useState<string | null>(null);
  const [sessionState, setSessionState] =
    useState<AuthSessionState>(initialSessionState);

  useLayoutEffect(() => {
    setVerifiedPath(null);
    setSessionState(initialSessionState);
    resetSessionGate();
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const session = await fetchSession();
      const authenticated = session.authenticated;
      const role = session.role as UserRole;

      if (cancelled) return;

      if (AUTH_REDIRECT_ROUTES.includes(pathname)) {
        if (authenticated) {
          resolveSessionGate();
          router.replace(getDefaultRedirect(role));
          return;
        }
        setSessionState({
          sessionReady: true,
          authenticated: false,
          role: null,
        });
        resolveSessionGate();
        setVerifiedPath(pathname);
        return;
      }

      const accessible = isRouteAccessible(pathname, role);

      if (!accessible) {
        resolveSessionGate();
        if (!authenticated) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        } else {
          router.replace(getDefaultRedirect(role));
        }
        return;
      }

      setSessionState({
        sessionReady: true,
        authenticated,
        role,
      });
      resolveSessionGate();
      setVerifiedPath(pathname);
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (verifiedPath !== pathname) {
    return <LoadingSpinner />;
  }

  return (
    <AuthSessionProvider value={sessionState}>{children}</AuthSessionProvider>
  );
};

export default ProtectedRoute;
