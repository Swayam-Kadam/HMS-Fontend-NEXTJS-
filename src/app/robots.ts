import type { MetadataRoute } from 'next';
import { ADMIN_ROUTES } from '@/conf/routes.config';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/login',
        '/signup',
        '/forgot-password',
        '/profile',
        '/appointment',
        '/success',
        '/unsuccess',
        ...ADMIN_ROUTES,
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
