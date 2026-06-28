'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ActiveLink from '@/components/activeLink/ActiveLink';
import Image from 'next/image';
import Logo from '../../public/images/logo.svg';
import { ChevronDown, Clock, LogOut, Mail, Menu, Phone, User } from 'lucide-react';
import { logoutRequest } from '@/utils/auth';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  logo?: React.ReactNode;
  navItems?: NavItem[];
  userName?: string;
  userAvatar?: string;
  isLoggedIn?: boolean;
  currentPath?: string;
}

const UserHeader: React.FC<HeaderProps> = ({
  navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/details' },
    { label: 'Appointment', href: '/appointment' },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Donation', href: '/donation' },
    { label: 'Profile', href: '/profile' },
    { label: 'Contact', href: '/contact-us' },
  ],
  userName = 'User',
  userAvatar,
  isLoggedIn = false,
}) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutRequest();
      setDropdownOpen(false);
      router.push('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const avatarInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="bg-blue-900 text-white py-2">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-[0.7rem] md:text-sm ">
          <div className="flex gap-4 mb-2 sm:mb-0">
            <span className="flex items-center gap-1"><Phone size={14} /> +1 234 567 890</span>
            <span className="flex items-center gap-1"><Mail size={14} /> info@cityhospital.com</span>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><Clock size={14} /> 24/7 Emergency</span>
            <span className="border-l border-blue-700 pl-3">Patient Portal</span>
          </div>
        </div>
      </div>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src={Logo}
                alt="Picture of the author"
                width={70}
                height={500}
              />
            </Link>
          </div>

          <div className="hidden md:flex md:items-center space-x-8 md:space-x-2">
            {navItems.map((item) => (
              <ActiveLink key={item.label} href={item.href.trim()}>
                {item.label}
              </ActiveLink>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <input
                type="checkbox"
                id="mobile-menu-toggle"
                className="hidden peer"
              />
              <label
                htmlFor="mobile-menu-toggle"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 cursor-pointer"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </label>

              <div className="hidden peer-checked:block absolute left-0 right-0 top-16 bg-white border-t border-gray-200 shadow-lg mt-[3.5rem]">
                <div className="px-4 py-3 space-y-2">
                  {navItems.map((item) => (
                    <div key={item.label} className="block py-2">
                      <ActiveLink href={item.href.trim()}>
                        {item.label}
                      </ActiveLink>
                    </div>
                  ))}
                  {!isLoggedIn ? (
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 text-center"
                    >
                      Sign In
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center justify-center gap-2 px-3 py-2 text-base font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-60"
                    >
                      <LogOut size={16} />
                      {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2 hover:bg-gray-50 transition-colors cursor-pointer"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {avatarInitial}
                      </span>
                    </div>
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
                    <div className="border-b border-gray-100 px-4 py-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userName}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                    >
                      <LogOut size={16} />
                      {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default UserHeader;
