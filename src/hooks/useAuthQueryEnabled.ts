'use client';

import { useAuthSession } from '@/context/AuthSessionContext';

export function useAuthQueryEnabled() {
  const { sessionReady, authenticated } = useAuthSession();
  return sessionReady && authenticated;
}
