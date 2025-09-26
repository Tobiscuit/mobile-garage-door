'use client'

import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-cloudy-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3 text-charcoal-blue">
          <svg className="h-8 w-8 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <h1 className="text-2xl font-bold tracking-tight">Mobile Garage Door</h1>
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
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cloudy-white border-t border-gray-200 shadow-lg">
          <div className="px-6 py-4 space-y-4">
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-colors font-medium" 
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-colors font-medium" 
              href="/services"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </a>
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-colors font-medium" 
              href="/portfolio"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Portfolio
            </a>
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-colors font-medium" 
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a 
              className="block text-charcoal-blue hover:text-golden-yellow transition-colors font-medium" 
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
            <a 
              className="block bg-golden-yellow text-charcoal-blue font-bold py-2 px-4 rounded-lg text-center hover:bg-golden-yellow/90 transition-colors" 
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get a Quote
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
