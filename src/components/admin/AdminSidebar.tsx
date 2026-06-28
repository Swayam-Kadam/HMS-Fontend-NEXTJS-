'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter} from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  Stethoscope,
  Users,
  MessageSquare,
  Mail,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Hospital,
  CalendarCheck,
} from 'lucide-react';
import Logo from '../../../public/images/logo.svg';
import { logoutRequest } from '@/utils/auth';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Add Doctor', href: '/add-doctor', icon: UserPlus },
  { label: 'Manage Appointment', href: '/manage-appointment', icon: CalendarCheck },
  { label: 'Manage Doctor', href: '/manage-doctor', icon: Stethoscope },
  { label: 'Manage User', href: '/manage-user', icon: Users },
  { label: 'User Messages', href: '/user-messages', icon: MessageSquare },
  { label: 'Contact Messages', href: '/contact-messages', icon: Mail },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const   AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 shrink-0">
        <Image src={Logo} alt="Logo" width={40} height={40} className="shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-tight truncate">Apollo Hospital</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 space-y-1 shrink-0">
        <Link
          href="/"
          title={collapsed ? 'View Site' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Hospital size={20} className="shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>
        <button
          onClick={async () => {
            await logoutRequest();
            router.push('/login');
          }}
          title={collapsed ? 'Logout' : undefined}
          className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-all"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-white transition-all mt-1"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
