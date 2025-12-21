'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useData } from '@/lib/data-context';

export default function Header() {
  const { isAdminLoggedIn, logoutAdmin } = useData();

  return (
    <header className="bg-white border-b border-navy-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
              <Image
                src="/logo.jpeg"
                alt="RAMPI Vote"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-bold text-navy-800">RAMPI <span className="text-gold-500">Vote</span></span>
          </Link>
          <nav className="flex items-center gap-2">
            {isAdminLoggedIn ? (
              <>
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg text-navy-700 hover:text-navy-900 hover:bg-navy-50 transition-all font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/votes/new"
                  className="px-4 py-2 rounded-lg text-navy-700 hover:text-navy-900 hover:bg-navy-50 transition-all font-medium"
                >
                  Nouveau vote
                </Link>
                <button
                  onClick={logoutAdmin}
                  className="px-4 py-2 ml-2 rounded-lg border-2 border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white transition-all text-sm font-medium"
                >
                  Deconnexion
                </button>
              </>
            ) : (
              <span className="text-navy-500 font-medium">Espace Administrateur</span>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
