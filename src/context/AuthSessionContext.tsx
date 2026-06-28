'use client';

import { createContext, useContext } from 'react';
import type { UserRole } from '@/conf/routes.config';

export interface AuthSessionState {
  sessionReady: boolean;
  authenticated: boolean;
  role: UserRole | null;
}

const defaultState: AuthSessionState = {
  sessionReady: false,
  authenticated: false,
  role: null,
};

const AuthSessionContext = createContext<AuthSessionState>(defaultState);

export const AuthSessionProvider = ({
  value,
  children,
}: {
  value: AuthSessionState;
  children: React.ReactNode;
}) => (
  <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
);

export const useAuthSession = () => useContext(AuthSessionContext);
