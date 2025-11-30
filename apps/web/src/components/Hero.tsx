import React from 'react';
import Image from 'next/image';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[60vh] text-white flex items-center justify-center text-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/social/og-image.png"
          alt="Mobile Garage Door - Professional Garage Door Services"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal-blue/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6">
        <h2 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Your Trusted Partner for Garage Doors</h2>
        <p className="text-xl mb-8 drop-shadow-md">Reliability and Professionalism, Guaranteed.</p>
        <a className="btn-primary text-lg px-8 py-3" href="/services">Schedule a Service</a>
      </div>
    </section>
  );
};

export default Hero;
