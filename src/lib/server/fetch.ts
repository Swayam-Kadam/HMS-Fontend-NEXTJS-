import conf from '@/conf/conf';

const API_BASE = conf.APIUrl.replace(/\/$/, '');

/** Builds an absolute backend URL from a path segment (e.g. `/doctor/`). */
export function buildApiUrl(path: string, params?: Record<string, string>): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${normalized.endsWith('/') ? normalized : `${normalized}/`}`;
  if (!params || Object.keys(params).length === 0) return url;
  const search = new URLSearchParams(params);
  return `${url}?${search.toString()}`;
}

/** Server-side GET against the Express backend (no auth cookie required for public routes). */
export async function serverGet<T>(
  path: string,
  params?: Record<string, string>,
  revalidate = 60
): Promise<T | null> {
  try {
    const res = await fetch(buildApiUrl(path, params), {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
