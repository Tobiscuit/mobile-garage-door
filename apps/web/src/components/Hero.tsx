import React from 'react';
import Image from 'next/image';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[70vh] text-white flex items-center justify-center text-center overflow-hidden">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/social/og-image.png"
          alt="Techno-Hero Garage Door Index"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Techno Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-deep/90 via-charcoal-deep/60 to-charcoal-deep/90"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 max-w-4xl">
        <div className="inline-block px-3 py-1 mb-6 border border-tech-cyan/30 rounded-full bg-charcoal-surface/50 backdrop-blur-sm">
          <span className="text-tech-cyan text-sm font-mono tracking-widest uppercase">System Online</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cloudy-white to-steel-gray drop-shadow-xl font-outfit">
          The Universal Garage Door Index
        </h1>

        <p className="text-xl md:text-2xl mb-10 text-steel-gray max-w-2xl mx-auto font-light leading-relaxed">
          Access the precision-engineered database of garage door specifications.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <a className="btn-molten text-lg px-10 py-4 font-bold tracking-wide uppercase" href="/instant-view">
            Try Instant-View
          </a>
          <a className="text-cloudy-white hover:text-brand-yellow transition-all border-b border-transparent hover:border-brand-yellow pb-1" href="/search">
            Search Database
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
