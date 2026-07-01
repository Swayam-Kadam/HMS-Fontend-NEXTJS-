import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

const PUBLIC_SITEMAP_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/doctors', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/details', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/donation', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact-us', changeFrequency: 'monthly', priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
