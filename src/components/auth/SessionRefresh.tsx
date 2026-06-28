'use client';

import { useEffect } from 'react';

const REFRESH_INTERVAL_MS = 14 * 60 * 1000;

const SessionRefresh = () => {
  useEffect(() => {
    const refreshSession = async () => {
      await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
    };

    const intervalId = setInterval(refreshSession, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return null;
};

export default SessionRefresh;
