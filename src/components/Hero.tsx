import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col md:flex-row text-white overflow-hidden font-display">
      {/* LEFT SIDE: URGENCY / REPAIR (Consumer Focus) */}
      <div className="relative w-full md:w-1/2 bg-charcoal-blue flex flex-col justify-center px-8 md:px-16 py-20 group">
        {/* Technical Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        
        <div className="relative z-10 max-w-xl mx-auto md:mr-0 md:ml-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            24/7 Emergency Response
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight">
            Door Stuck?<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              We Fix It Now.
            </span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed">
            Don't get trapped. Our Rapid Response fleet is typically on-site within 2 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact?type=repair" className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              Call 24/7 Repair
            </Link>
            <a href="/services#repair" className="flex items-center justify-center gap-2 text-gray-300 font-medium py-4 px-6 hover:text-white transition-colors">
              View Repair Rates
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: PARTNERSHIP / INSTALL (Pro Focus) */}
      <div className="relative w-full md:w-1/2 bg-cloudy-white text-charcoal-blue flex flex-col justify-center px-8 md:px-16 py-20 border-t md:border-t-0 md:border-l border-white/10">
        <div className="relative z-10 max-w-xl mx-auto md:ml-0 md:mr-auto">
          <div className="inline-flex items-center gap-2 bg-golden-yellow/10 border border-golden-yellow/40 text-charcoal-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <svg className="w-3 h-3 text-golden-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            Rated #1 by Local Contractors
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight text-charcoal-blue">
            The Contractor's<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-golden-yellow">
              Secret Weapon.
            </span>
          </h1>
          
          <p className="text-lg text-steel-gray mb-8 max-w-md leading-relaxed">
            Volume pricing, guaranteed scheduling, and white-label installation for home builders and general contractors.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/portfolio" className="flex items-center justify-center gap-3 bg-charcoal-blue text-white hover:bg-dark-charcoal font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              View Deployment Catalog
            </a>
            <a href="/contact?type=contractor" className="flex items-center justify-center gap-2 text-charcoal-blue font-bold py-4 px-6 hover:text-golden-yellow transition-colors group">
              Partner Access
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
