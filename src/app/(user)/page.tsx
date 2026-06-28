import type { Metadata } from 'next';
import HomeContent from '@/components/home/HomeContent';
import { fetchDoctorsServer } from '@/lib/server/doctors';

export const metadata: Metadata = {
  title: 'Apollo Hospital | Exceptional Healthcare',
  description:
    'Apollo Hospital provides compassionate, advanced medical care with expert doctors, modern facilities, and 24/7 emergency services.',
};

export default async function HomePage() {
  const doctors = await fetchDoctorsServer();

  return (
    <HomeContent featuredDoctors={doctors} doctorCount={doctors.length} />
  );
}
