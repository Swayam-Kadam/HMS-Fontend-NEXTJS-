'use client';

import { useEffect } from 'react';
import { useAuthSession } from '@/context/AuthSessionContext';

export function useAuthenticatedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList = []
) {
  const { sessionReady, authenticated } = useAuthSession();

  useEffect(() => {
    if (!sessionReady || !authenticated) {
      return;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady, authenticated, ...deps]);
}
