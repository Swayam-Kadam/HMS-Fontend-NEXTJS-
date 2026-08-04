import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SupportChatContent from '@/components/support/SupportChatContent';
import { buildPageMetadata } from '@/lib/metadata';
import HospitalImage from '../../../../public/images/Apollo-Hospital.webp';

export const metadata = buildPageMetadata({
  title: 'Support Chat',
  description: 'Chat live with Apollo Hospital admin support.',
  path: '/support',
  private: true,
});

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-48 sm:h-56 overflow-hidden">
        <Image
          src={HospitalImage}
          alt="Apollo Hospital"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/85 to-blue-800/70" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-16">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-2">
            Patient Portal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Support Chat
          </h1>
          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-blue-400">/</span>
            <span className="text-white font-medium">Support</span>
          </div>
        </div>
      </section>

      <SupportChatContent />
    </div>
  );
};

export default SupportPage;
