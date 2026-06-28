import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProfileContent from '@/components/profile/ProfileContent';
import HospitalImage from '../../../../public/images/Apollo-Hospital.webp';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero with real hospital image */}
      <section className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
        <Image
          src={HospitalImage}
          alt="Apollo Hospital"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/85 to-blue-800/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-23">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-2">
            Patient Portal
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            My Profile
          </h1>
          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-blue-400">/</span>
            <span className="text-white font-medium">Profile</span>
          </div>
        </div>
      </section>

      <ProfileContent />
    </div>
  );
};

export default ProfilePage;
