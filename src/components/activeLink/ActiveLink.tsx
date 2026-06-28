'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ActiveLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export default function ActiveLink({
  href,
  children,
  className = 'px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap',
  activeClassName = 'text-blue-600 border-b-2 border-blue-600',
  inactiveClassName = 'text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600',
}: ActiveLinkProps) {
  const pathname = usePathname();
  
  const isActive = (() => {
    const itemHref = href.trim();
    if (itemHref === '/') {
      return pathname === '/';
    }
    return pathname === itemHref || pathname.startsWith(itemHref + '/');
  })();

  return (
    <Link
      href={href}
      className={`${className} ${isActive ? activeClassName : inactiveClassName}`}
    >
      {children}
    </Link>
  );
}