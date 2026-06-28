'use client';

import { Bell, Search, Menu } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

const AdminHeader = ({ title, subtitle, sidebarCollapsed, onMenuClick }: AdminHeaderProps) => {
  return (
    <header
      className={`sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ml-0 ${
        sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500 hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none w-40 text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <button
            type="button"
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">Admin</p>
              <p className="text-[11px] text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
