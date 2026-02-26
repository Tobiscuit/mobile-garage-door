'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const Hero: React.FC = () => {
  const t = useTranslations('hero');
  
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
            {t('emergency_badge')}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight">
            {t('door_stuck')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              {t('fix_now')}
            </span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed">
            {t('left_desc')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/diagnose" className="flex items-center justify-center gap-3 bg-white text-red-600 font-black py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 relative overflow-hidden group">
               <span className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-20 transition-opacity"></span>
               {/* Pulsating Ring */}
               <span className="relative flex h-3 w-3 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
               </span>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
               {t('ai_diagnosis')}
            </Link>
            <Link href="/contact?type=repair" className="flex items-center justify-center gap-2 bg-red-600/20 border border-red-500/30 hover:bg-red-600/40 text-red-100 font-bold py-4 px-6 rounded-xl transition-all backdrop-blur-sm">
               {t('request_callback')}
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-red-200/60 font-medium px-1">
             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path></svg>
             <span>{t('wait_time')}</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: PARTNERSHIP / INSTALL (Pro Focus) */}
      <div className="relative w-full md:w-1/2 bg-cloudy-white text-charcoal-blue flex flex-col justify-center px-8 md:px-16 py-20 border-t md:border-t-0 md:border-l border-white/10">
        <div className="relative z-10 max-w-xl mx-auto md:ml-0 md:mr-auto">
          <div className="inline-flex items-center gap-2 bg-golden-yellow/10 border border-golden-yellow/40 text-charcoal-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <svg className="w-3 h-3 text-golden-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            {t('rated_badge')}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight text-charcoal-blue">
            {t('contractor_title')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-golden-yellow">
              {t('secret_weapon')}
            </span>
          </h1>
          
          <p className="text-lg text-steel-gray mb-8 max-w-md leading-relaxed">
            {t('right_desc')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/portfolio" className="flex items-center justify-center gap-3 bg-charcoal-blue text-white hover:bg-dark-charcoal font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              {t('view_catalog')}
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-2 text-charcoal-blue font-bold py-4 px-6 hover:text-golden-yellow transition-colors group">
              {t('builder_portal')}
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
