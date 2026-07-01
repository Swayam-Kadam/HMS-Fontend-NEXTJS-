export const SITE_NAME = 'Apollo Hospital';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_REDIRECT_URL ??
  'http://localhost:3000'
).replace(/\/$/, '');

export const DEFAULT_OG_IMAGE = '/images/Apollo-Hospital.webp';
