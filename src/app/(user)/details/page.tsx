import type { Metadata } from 'next';
import DetailsContent from '@/components/details/DetailsContent';

export const metadata: Metadata = {
  title: 'About Us | Apollo Hospital',
  description:
    'Learn about Apollo Hospital — our mission, facilities, leadership, and commitment to exceptional healthcare since 1995.',
};

export default function DetailsPage() {
  return <DetailsContent />;
}
