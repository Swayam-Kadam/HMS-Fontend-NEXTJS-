import DetailsContent from '@/components/details/DetailsContent';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata = buildPageMetadata({
  title: 'About Us',
  description:
    'Learn about Apollo Hospital — our mission, facilities, leadership, and commitment to exceptional healthcare since 1995.',
  path: '/details',
  image: '/images/about/head.webp',
});

export default function DetailsPage() {
  return <DetailsContent />;
}
