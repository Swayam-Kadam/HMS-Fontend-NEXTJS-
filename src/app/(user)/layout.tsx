// app/(user)/layout.tsx
import { headers } from 'next/headers';
import UserHeader from '@/layout/UserHeader';
import UserFotter from '@/layout/UserFotter';
import { cookies } from 'next/headers';
import { AUTH_REFRESH_COOKIE, AUTH_TOKEN_COOKIE } from '@/lib/auth/cookies';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const currentPath = headersList.get('x-pathname') || '/';

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
  const refresh = cookieStore.get(AUTH_REFRESH_COOKIE)?.value;
  const isLoggedIn = Boolean(token || refresh);
  return (
    <>
      <UserHeader currentPath={currentPath} isLoggedIn={isLoggedIn} />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <UserFotter/>
    </>
  );
}