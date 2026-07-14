import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import DoctorDetailContent from '@/components/doctors/DoctorDetailContent';
import { buildPageMetadata } from '@/lib/metadata';
import { fetchDoctorByIdServer } from '@/lib/server/doctors';
import DoctorImage from '../../../../../public/images/about/doctors.webp';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const doctor = await fetchDoctorByIdServer(id);

  if (!doctor) {
    return buildPageMetadata({
      title: 'Doctor Not Found',
      description: 'The requested doctor profile could not be found.',
      path: `/doctors/${id}`,
      image: '/images/about/doctors.webp',
    });
  }

  return buildPageMetadata({
    title: doctor.fullName,
    description: `View profile for ${doctor.fullName}, ${doctor.department} specialist at Apollo Hospital. Book an appointment online.`,
    path: `/doctors/${doctor.id}`,
    image: '/images/about/doctors.webp',
  });
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const doctor = await fetchDoctorByIdServer(id);

  if (!doctor) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
        <Image
          src={DoctorImage}
          alt="Apollo Hospital doctors"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/85 to-cyan-900/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-20">
          <p className="text-cyan-200 text-sm font-medium tracking-widest uppercase mb-2">
            Expert Care · Trusted Specialists
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 capitalize">
            {doctor.fullName}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mb-3">
            {doctor.department} specialist at Apollo Hospital
          </p>
          <div className="flex items-center gap-2 text-blue-200 text-sm flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-blue-400">/</span>
            <Link href="/doctors" className="hover:text-white transition-colors">
              Doctors
            </Link>
            <span className="text-blue-400">/</span>
            <span className="text-white font-medium capitalize">{doctor.fullName}</span>
          </div>
        </div>
      </section>

      <DoctorDetailContent doctor={doctor} />
    </div>
  );
}
