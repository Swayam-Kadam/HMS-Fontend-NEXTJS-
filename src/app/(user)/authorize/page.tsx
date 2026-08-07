import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthorizeContent from '@/components/auth/AuthorizeContent';

export const metadata: Metadata = {
  title: 'Login Required',
  description: 'Please login to access this page.',
  robots: { index: false, follow: false },
};

const AuthorizePage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthorizeContent />
    </Suspense>
  );
};

export default AuthorizePage;
