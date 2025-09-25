import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-cloudy-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <svg className="h-8 w-8 text-charcoal-blue" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
          </svg>
          <h1 className="text-2xl font-bold text-charcoal-blue">Mobile Garage Solutions</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-charcoal-blue hover:text-golden-yellow transition-colors" href="#services">Services</a>
          <a className="text-charcoal-blue hover:text-golden-yellow transition-colors" href="#about">About Us</a>
          <a className="text-charcoal-blue hover:text-golden-yellow transition-colors" href="#contact">Contact</a>
          <a className="btn-primary" href="#quote">Get a Quote</a>
        </nav>
        <button className="md:hidden">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
