'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/lib/data-context';

/* eslint-disable @next/next/no-img-element */

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminLoggedIn, isSuperAdmin, logoutAdmin } = useData();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.push('/admin/login');
    }
  }, [isAdminLoggedIn, router]);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  if (!isAdminLoggedIn) {
    return null;
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    {
      id: 'votes',
      label: 'Votes',
      href: '/admin/votes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    ...(isSuperAdmin ? [{
      id: 'admins',
      label: 'Administrateurs',
      href: '/admin/admins',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }] : [])
  ];

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r-2 border-slate-200 transition-all duration-300 z-50 flex flex-col ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'}`}>
        {/* Logo */}
        <div className={`p-5 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src="/logo.jpeg"
              alt="RAMPI"
              className="w-full h-full object-cover"
            />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-slate-800 text-lg">RAMPI</span>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center shadow-sm hover:shadow transition-all z-10"
        >
          <svg className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-navy-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={`flex-shrink-0 ${active ? 'text-gold-400' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="font-medium text-[15px]">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-1">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? 'Deconnexion' : undefined}
          >
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span className="font-medium text-[15px]">Deconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[240px]'}`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
