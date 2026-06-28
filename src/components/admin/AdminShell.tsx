'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: "Welcome back! Here's your hospital overview." },
  '/add-doctor': { title: 'Add Doctor', subtitle: 'Register new doctors to the hospital system.' },
  '/manage-doctor': { title: 'Manage Doctors', subtitle: 'View and filter all registered doctors by department.' },
  '/manage-user': { title: 'Manage Users', subtitle: 'View, edit, and remove registered patient accounts.' },
  '/manage-appointment': { title: 'Manage Appointments', subtitle: 'View and update all patient appointment requests.' },
  '/user-messages': { title: 'User Messages', subtitle: 'Review and respond to patient messages.' },
  '/contact-messages': { title: 'Contact Messages', subtitle: 'Manage incoming contact form submissions.' },
};

interface AdminShellProps {
  children: React.ReactNode;
}

const AdminShell = ({ children }: AdminShellProps) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const meta = pageMeta[pathname] ?? { title: 'Admin', subtitle: 'Hospital management system' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>
      )}

      <AdminHeader
        title={meta.title}
        subtitle={meta.subtitle}
        sidebarCollapsed={collapsed}
        onMenuClick={() => setMobileOpen(true)}
      />

      <main
        className={`p-4 sm:p-6 transition-all duration-300 ml-0 ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminShell;
