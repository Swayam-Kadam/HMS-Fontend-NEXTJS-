'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SessionRefresh from './SessionRefresh';
import { fetchSession } from '@/utils/auth';
import { AUTH_REDIRECT_ROUTES, getDefaultRedirect } from '@/conf/routes.config';
import type { UserRole } from '@/conf/routes.config';
import {
  AuthSessionProvider,
  type AuthSessionState,
} from '@/context/AuthSessionContext';
import { resolveSessionGate } from '@/lib/auth/sessionGate';

interface AuthProviderProps {
  children: React.ReactNode;
}

const initialSessionState: AuthSessionState = {
  sessionReady: false,
  authenticated: false,
  role: null,
};

/**
 * Lightweight session provider for UI state (nav links, axios gate).
 * Route protection is handled by middleware — children render immediately
 * without a full-page auth spinner.
 */
const AuthProvider = ({ children }: AuthProviderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionState, setSessionState] =
    useState<AuthSessionState>(initialSessionState);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const session = await fetchSession();

        if (cancelled) return;

        if (AUTH_REDIRECT_ROUTES.includes(pathname) && session.authenticated) {
          router.replace(getDefaultRedirect(session.role as UserRole));
          resolveSessionGate();
          return;
        }

        setSessionState({
          sessionReady: true,
          authenticated: session.authenticated,
          role: session.role as UserRole,
        });
      } catch {
        if (!cancelled) {
          setSessionState({
            sessionReady: true,
            authenticated: false,
            role: null,
          });
        }
      } finally {
        resolveSessionGate();
      }
    };

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return (
    <AuthSessionProvider value={sessionState}>
      <SessionRefresh />
      {children}
    </AuthSessionProvider>
  );
};

export default AuthProvider;
