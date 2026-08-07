'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Headphones,
  Home,
  LogIn,
  ShieldAlert,
  User,
} from 'lucide-react';

const PAGE_META: Record<
  string,
  { label: string; description: string; icon: typeof Calendar }
> = {
  '/appointment': {
    label: 'Appointment',
    description:
      'Book and manage hospital visits with our specialists after you sign in.',
    icon: Calendar,
  },
  '/support': {
    label: 'Support',
    description:
      'Chat live with hospital admin support once your account is authorized.',
    icon: Headphones,
  },
  '/profile': {
    label: 'Profile',
    description:
      'View your personal details, appointments, and messages after login.',
    icon: User,
  },
};

const AuthorizeContent = () => {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';

  const meta = useMemo(() => {
    return (
      PAGE_META[redirectPath] || {
        label: 'this page',
        description:
          'Please sign in with your account to continue to the requested page.',
        icon: ShieldAlert,
      }
    );
  }, [redirectPath]);

  const Icon = meta.icon;
  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
          <Icon size={40} className="text-amber-600" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-2">
          Authorization Required
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Login to access {meta.label}
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          You need to login to access the {meta.label} page. {meta.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={loginHref}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100"
          >
            <LogIn size={18} />
            Login / Authorize
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            <Home size={18} />
            Return Home
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthorizeContent;
