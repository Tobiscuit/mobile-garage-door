'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isMobileMenuOpen
          ? 'bg-charcoal-deep/80 backdrop-blur-md border-b border-white/5 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-brand-yellow to-yellow-600 rounded-lg shadow-neon group-hover:shadow-[0_0_15px_rgba(241,196,15,0.6)] transition-all">
             <svg className="h-6 w-6 text-charcoal-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-outfit uppercase">
            Mobile <span className="text-brand-yellow">Garage Door</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-medium text-cloudy-white hover:text-brand-yellow transition-colors uppercase tracking-wider" href="/">Index</Link>
          <Link className="text-sm font-medium text-cloudy-white hover:text-brand-yellow transition-colors uppercase tracking-wider" href="/services">Services</Link>
          <Link className="text-sm font-medium text-cloudy-white hover:text-brand-yellow transition-colors uppercase tracking-wider" href="/portfolio">Showcase</Link>
          <Link className="text-sm font-medium text-cloudy-white hover:text-brand-yellow transition-colors uppercase tracking-wider" href="/about">About</Link>
          <Link className="px-5 py-2 border border-brand-yellow/50 text-brand-yellow rounded hover:bg-brand-yellow hover:text-charcoal-deep transition-all font-bold uppercase text-xs tracking-widest shadow-[0_0_10px_rgba(241,196,15,0.1)] hover:shadow-[0_0_20px_rgba(241,196,15,0.4)]" href="/contact">
            Access System
          </Link>
        </nav>

        <button 
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            ) : (
              <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-charcoal-surface border-t border-white/5 ${
        isMobileMenuOpen 
          ? 'max-h-96 opacity-100'
          : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 py-4 space-y-1">
          {['Index', 'Services', 'Showcase', 'About', 'Contact'].map((item) => (
             <Link
              key={item}
              className="block text-cloudy-white hover:text-brand-yellow hover:bg-white/5 transition-all font-medium py-3 px-4 rounded"
              href={`/${item.toLowerCase()}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="pt-4 mt-2">
            <Link
              className="block w-full text-center bg-brand-yellow text-charcoal-deep font-bold py-3 px-6 rounded hover:bg-white transition-colors"
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ACCESS SYSTEM
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
