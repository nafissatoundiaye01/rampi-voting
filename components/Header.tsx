'use client';

import Link from 'next/link';
import { useData } from '@/lib/data-context';

/* eslint-disable @next/next/no-img-element */

export default function Header() {
  const { isAdminLoggedIn, logoutAdmin } = useData();

  return (
    <header className="header">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/10 group-hover:ring-accent/30 transition-all">
              <img
                src="/logo.jpeg"
                alt="RAMPI Vote"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">RAMPI <span className="text-accent">Vote</span></span>
              <span className="text-xs text-text-secondary -mt-0.5">Administration</span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {isAdminLoggedIn ? (
              <>
                <Link
                  href="/admin"
                  className="btn btn-ghost px-4 py-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/admin/votes/new"
                  className="btn btn-accent px-4 py-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau vote
                </Link>
                <button
                  onClick={logoutAdmin}
                  className="btn btn-outline px-4 py-2 ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </>
            ) : (
              <span className="badge badge-primary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Espace Administrateur
              </span>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
