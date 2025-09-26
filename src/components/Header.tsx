'use client'

import React, { useState } from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-cloudy-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3 text-charcoal-blue">
          {/* Desktop Logo */}
          <div className="hidden md:block">
            <Image
              src="/images/logos/logo-placeholder.svg"
              alt="Mobile Garage Door"
              width={200}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>
          
          {/* Mobile Logo */}
          <div className="block md:hidden">
            <Image
              src="/images/logos/logo-mobile-placeholder.svg"
              alt="Mobile Garage Door"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          
          {/* Fallback Text Logo (if images don't exist) */}
          <h1 className="text-2xl font-bold tracking-tight md:hidden">Mobile Garage Door</h1>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-charcoal-blue hover:text-golden-yellow transition-colors" href="/">Home</a>
          <a className="text-charcoal-blue hover:text-golden-yellow transition-colors" href="/services">Services</a>
          <a className="text-charcoal-blue hover:text-golden-yellow transition-colors" href="/portfolio">Portfolio</a>
          <a className="text-charcoal-blue hover:text-golden-yellow transition-colors" href="#about">About Us</a>
          <a className="text-charcoal-blue hover:text-golden-yellow transition-colors" href="/contact">Contact</a>
          <a className="btn-primary" href="/contact">Get a Quote</a>
        </nav>
        <button 
          className="md:hidden"
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
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
        isMobileMenuOpen 
          ? 'max-h-96 opacity-100 transform translate-y-0' 
          : 'max-h-0 opacity-0 transform -translate-y-2'
      }`}>
        <div className="bg-gradient-to-b from-cloudy-white to-white border-t border-golden-yellow/20 shadow-2xl backdrop-blur-sm">
          <div className="px-6 py-6 space-y-1">
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-golden-yellow/10 transform hover:translate-x-2" 
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </span>
            </a>
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-golden-yellow/10 transform hover:translate-x-2" 
              href="/services"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                Services
              </span>
            </a>
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-golden-yellow/10 transform hover:translate-x-2" 
              href="/portfolio"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Portfolio
              </span>
            </a>
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-golden-yellow/10 transform hover:translate-x-2" 
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About Us
              </span>
            </a>
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-golden-yellow/10 transform hover:translate-x-2" 
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </span>
            </a>
            
            {/* Call to Action with Special Styling */}
            <div className="pt-4 mt-4 border-t border-golden-yellow/20">
              <a 
                className="block bg-gradient-to-r from-golden-yellow to-yellow-400 text-charcoal-blue font-bold py-4 px-6 rounded-xl text-center hover:from-yellow-400 hover:to-golden-yellow transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" 
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get a Quote
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
