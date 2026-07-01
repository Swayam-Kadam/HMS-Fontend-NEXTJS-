import HomeContent from '@/components/home/HomeContent';
import { buildPageMetadata } from '@/lib/metadata';
import { fetchDoctorsServer } from '@/lib/server/doctors';

export const metadata = buildPageMetadata({
  title: 'Exceptional Healthcare',
  description:
    'Apollo Hospital provides compassionate, advanced medical care with expert doctors, modern facilities, and 24/7 emergency services.',
  path: '/',
  image: '/images/Apollo-Hospital.webp',
});

export default async function HomePage() {
  const doctors = await fetchDoctorsServer();

  return (
    <HomeContent featuredDoctors={doctors} doctorCount={doctors.length} />
  );
}
