import conf from '@/conf/conf';

export interface RefreshResult {
  success: boolean;
  token?: string;
  refresh?: string;
  role?: string;
}

let inFlightRefresh: Promise<RefreshResult> | null = null;
let inFlightRefreshKey: string | null = null;

async function callBackendRefresh(
  refreshToken: string,
  role: string
): Promise<RefreshResult> {
  const apiBase = conf.APIUrl.replace(/\/$/, '');

  const backendRes = await fetch(`${apiBase}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await backendRes.json().catch(() => ({}));
  const payload = data?.data ?? data;
  const token = payload?.authtoken ?? payload?.token ?? data?.authtoken;
  const newRefresh =
    payload?.refreshToken ?? payload?.refresh ?? data?.refreshToken ?? data?.refresh;

  if (!backendRes.ok || !token) {
    return { success: false };
  }

  return {
    success: true,
    token,
    refresh: newRefresh ?? refreshToken,
    role,
  };
}

export async function refreshWithLock(
  refreshToken: string,
  role: string
): Promise<RefreshResult> {
  if (inFlightRefresh && inFlightRefreshKey === refreshToken) {
    return inFlightRefresh;
  }

  inFlightRefreshKey = refreshToken;
  inFlightRefresh = callBackendRefresh(refreshToken, role).finally(() => {
    inFlightRefresh = null;
    inFlightRefreshKey = null;
  });

  return inFlightRefresh;
}
