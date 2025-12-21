'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/data-context';

export default function AdminPage() {
  const router = useRouter();
  const { isAdminLoggedIn } = useData();

  useEffect(() => {
    if (isAdminLoggedIn) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/login');
    }
  }, [isAdminLoggedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">Chargement...</p>
      </div>
    </div>
  );
}
