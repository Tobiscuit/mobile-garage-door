'use client'

import React, { useState, useEffect } from 'react';
import Link from '@/shared/ui/Link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { authClient } from '@/lib/auth-client';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { data: session } = authClient.useSession();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const isActive = (path: string) => pathname === path || pathname.endsWith(path);

  const role = (session?.user as any)?.role;
  const isStaff = role === 'admin' || role === 'dispatcher' || role === 'technician';
  const isPortal = pathname.startsWith('/portal');

  const getDashboardUrl = () => {
    if (role === 'technician') return '/dashboard/technician';
    return '/dashboard'; // Admin & Dispatcher
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/10 backdrop-blur-xl bg-charcoal-blue/90 text-white supports-[backdrop-filter]:bg-charcoal-blue/60">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO: Company Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white rounded-lg overflow-hidden w-10 h-10 flex-shrink-0 group-hover:shadow-[0_0_12px_rgba(241,196,15,0.3)] transition-shadow">
              <img
                src="/images/logos/logo.jpg"
                alt="Mobil Garage Door"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight font-display">
              MOBIL<span className="text-gray-300 font-light">GARAGE</span>
            </span>
          </Link>



          {/* DESKTOP NAV: The "Command Center" */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {[
              { path: '/services', label: t('services') },
              { path: '/portfolio', label: t('portfolio') },
              { path: '/blog', label: t('blog') },
              { path: '/about', label: t('about') }
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${isActive(link.path)
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            {isStaff && isPortal ? (
              <Link
                href={getDashboardUrl()}
                className="flex items-center gap-1.5 bg-golden-yellow text-charcoal-blue hover:bg-yellow-400 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(241,196,15,0.2)] hover:shadow-[0_0_20px_rgba(241,196,15,0.4)] hover:-translate-x-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Dashboard
              </Link>
            ) : (
              <Link href={session ? getDashboardUrl() : "/login"} className="text-sm font-bold text-golden-yellow hover:text-yellow-300 transition-colors uppercase tracking-wider text-[10px]">
                {session ? 'DASHBOARD' : t('login')}
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              ) : (
                <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu - Full Screen Overlay */}
      <div className={`fixed inset-0 z-40 bg-charcoal-blue/98 backdrop-blur-3xl transition-all duration-300 md:hidden flex flex-col pt-24 px-6 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}>
        <div className="flex flex-col gap-6 text-center">
          {[
            { path: '/services', label: t('services') },
            { path: '/portfolio', label: t('portfolio') },
            { path: '/blog', label: t('blog') },
            { path: '/about', label: t('about') }
          ].map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-2xl font-bold transition-colors ${isActive(link.path) ? 'text-golden-yellow' : 'text-white hover:text-golden-yellow'
                }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px w-20 mx-auto bg-white/10 my-4"></div>
          {(!isStaff || !isPortal) && (
            <Link href={session ? getDashboardUrl() : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-golden-yellow uppercase tracking-widest">
              {session ? 'DASHBOARD' : t('login')}
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
