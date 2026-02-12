import React from 'react';

interface ContactHeroProps {
  type: 'repair' | 'install' | 'general';
}

export function ContactHero({ type }: ContactHeroProps) {
  const isEmergency = type === 'repair';
  const accentColor = isEmergency ? 'text-red-500' : 'text-golden-yellow';
  const bgColor = isEmergency ? 'bg-dark-charcoal' : 'bg-charcoal-blue';
  const patternColor = isEmergency ? '#ef4444' : '#f1c40f'; // Red-500 or Yellow-400

  return (
    <section className={`relative pt-48 pb-32 px-6 overflow-hidden font-display ${bgColor}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(${patternColor} 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}></div>

      <div className="container mx-auto max-w-6xl relative z-10 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border ${isEmergency ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-golden-yellow/10 border-golden-yellow/20 text-golden-yellow'}`}>
          {isEmergency ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              24/7 Emergency Dispatch
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-golden-yellow"></span>
              Project Consultation
            </>
          )}
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
          {isEmergency ? (
            <>System <span className="text-red-500">Critical?</span></>
          ) : (
            type === 'install' ? (
              <>Build Your <span className="text-golden-yellow">Vision</span></>
            ) : (
              <>Let's <span className="text-golden-yellow">Connect</span></>
            )
          )}
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {isEmergency
            ? "Immediate response required. Our rapid dispatch team is standing by to deploy industrial-grade repair solutions."
            : "Whether it's a new installation or a custom upgrade, our engineers are ready to architect the perfect access solution."
          }
        </p>
      </div>

      {/* Gradient Fade for overlap */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cloudy-white to-transparent"></div>
    </section>
  );
}
