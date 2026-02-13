'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobileMenu } from '@/hooks/useMobileMenu';

const Header: React.FC = () => {
  const { isOpen, toggle, close } = useMobileMenu();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/10 backdrop-blur-xl bg-charcoal-blue/90 text-white supports-[backdrop-filter]:bg-charcoal-blue/60">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO: Engineered & Solid */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-golden-yellow/10 p-2 rounded-lg border border-golden-yellow/20 group-hover:border-golden-yellow/50 transition-colors">
              <svg className="h-6 w-6 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight font-display">
              MOBIL<span className="text-gray-300 font-light">GARAGE</span>
            </span>
          </Link>

          {/* DESKTOP NAV: The "Command Center" */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {[
              { path: '/services', label: 'Services' },
              { path: '/portfolio', label: 'Portfolio' },
              { path: '/about', label: 'About' }
            ].map((link) => (
              <Link 
                key={link.path}
                href={link.path} 
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(link.path) 
                    ? 'bg-white/10 text-white shadow-inner' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTIONS: Bifurcated (Pro vs Emergency) */}
          <div className="hidden md:flex items-center gap-4">
             {/* Pro Link */}
            <Link href="/contact?type=contractor" className="text-sm font-bold text-golden-yellow hover:text-yellow-300 transition-colors uppercase tracking-wider text-[10px]">
              For Contractors
            </Link>
            
            <div className="h-8 w-px bg-white/10"></div>

            {/* Emergency CTA */}
            <Link href="/contact?type=repair" className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-red-900/20 transition-all hover:scale-105">
              <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              <span>24/7 Repair</span>
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button 
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={toggle}
            aria-label="Toggle menu"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              ) : (
                <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              )}
            </svg>
          </button>
        </div>
      </header>
      
      {/* Mobile Navigation Menu - Full Screen Overlay */}
      <div className={`fixed inset-0 z-40 bg-charcoal-blue/98 backdrop-blur-3xl transition-all duration-300 md:hidden flex flex-col pt-24 px-6 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
      }`}>
        <div className="flex flex-col gap-6 text-center">
          {[
            { path: '/services', label: 'Services' },
            { path: '/portfolio', label: 'Portfolio' },
            { path: '/about', label: 'About Us' }
          ].map((link) => (
            <Link 
              key={link.path}
              href={link.path} 
              onClick={close}
              className={`text-2xl font-bold transition-colors ${
                isActive(link.path) ? 'text-golden-yellow' : 'text-white hover:text-golden-yellow'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px w-20 mx-auto bg-white/10 my-4"></div>
          <Link href="/contact?type=contractor" onClick={close} className="text-lg font-bold text-golden-yellow uppercase tracking-widest">
            Contractor Portal
          </Link>
          <Link href="/contact?type=repair" className="mt-8 bg-red-600 text-white font-bold py-5 rounded-2xl text-xl shadow-xl flex items-center justify-center gap-3">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
             24/7 Emergency
          </Link>
        </div>
      </div>
    </>
  );
};

export default Header;
