import HomeContent from '@/components/home/HomeContent';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Exceptional Healthcare',
  description:
    'Apollo Hospital provides compassionate, advanced medical care with expert doctors, modern facilities, and 24/7 emergency services.',
  path: '/',
  image: '/images/Apollo-Hospital.webp',
});

export default function HomePage() {
  return <HomeContent />;
}
