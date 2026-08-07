import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';
import type { Metadata } from 'next';
import UserHeader from '@/layout/UserHeader';
import UserFooter from '@/layout/UserFooter';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has been moved.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <UserHeader />
      <main className="min-h-screen bg-gray-50">
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
              <SearchX size={40} className="text-blue-600" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">
              Error 404
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
              have been moved, deleted, or the URL might be incorrect.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100"
              >
                <Home size={18} />
                Return Home
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>
      <UserFooter />
    </>
  );
}
