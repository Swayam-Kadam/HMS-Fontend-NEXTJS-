import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import DonationContent from '@/components/donation/DonationContent';
import { fetchDonorsServer } from '@/lib/server/donations';
import DonationImage from '../../../../public/images/about/donation.jpg';

export const metadata: Metadata = {
  title: 'Donation Registry | Apollo Hospital',
  description:
    'View registered blood and heart donors at Apollo Hospital. Join our donation registry and help save lives.',
};

export default async function DonationPage() {
  const { blood, heart } = await fetchDonorsServer();

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
        <Image
          src={DonationImage}
          alt="Apollo Hospital donation registry"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 via-blue-950/85 to-blue-900/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-20">
          <p className="text-red-200 text-sm font-medium tracking-widest uppercase mb-2">
            Give Hope · Save Lives
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            Donation Registry
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mb-3">
            View registered blood and heart donors at Apollo Hospital
          </p>
          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-blue-400">/</span>
            <span className="text-white font-medium">Donation</span>
          </div>
        </div>
      </section>

      <DonationContent initialBloodDonors={blood} initialHeartDonors={heart} />
    </div>
  );
}
