import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DoctorsContent from '@/components/doctors/DoctorsContent';
import DoctorImage from '../../../../public/images/about/doctors.webp';

const DoctorsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
        <Image
          src={DoctorImage}
          alt="Apollo Hospital"
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            Our Doctors
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mb-3">
            Meet the experienced specialists caring for patients at Apollo Hospital
          </p>
          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-blue-400">/</span>
            <span className="text-white font-medium">Doctors</span>
          </div>
        </div>
      </section>

      <DoctorsContent />
    </div>
  );
};

export default DoctorsPage;
