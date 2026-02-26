'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

interface ContactHeroProps {
  type: 'repair' | 'install' | 'contractor' | 'general';
}

export function ContactHero({ type }: ContactHeroProps) {
  const t = useTranslations('contact_hero');
  const isEmergency = type === 'repair';
  const isContractor = type === 'contractor';

  const accentColor = isEmergency ? 'text-red-500' : 'text-golden-yellow';
  const bgColor = isEmergency ? 'bg-dark-charcoal' : 'bg-charcoal-blue';
  const patternColor = isEmergency ? '#ef4444' : '#f1c40f';

  return (
    <section className={`relative pt-48 pb-32 px-6 overflow-hidden font-display ${bgColor}`}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(${patternColor} 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}></div>

      <div className="container mx-auto max-w-6xl relative z-10 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border ${isEmergency ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-golden-yellow/10 border-golden-yellow/20 text-golden-yellow'}`}>
          {isEmergency ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {t('emergency_badge')}
            </>
          ) : isContractor ? (
            <>
              <span className="w-2 h-2 rounded-full bg-golden-yellow"></span>
              {t('contractor_badge')}
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-golden-yellow"></span>
              {t('consultation_badge')}
            </>
          )}
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
          {isEmergency ? (
            <>{t('emergency_heading')} <span className="text-red-500">{t('emergency_accent')}</span></>
          ) : isContractor ? (
            <>{t('contractor_heading')} <span className="text-golden-yellow">{t('contractor_accent')}</span></>
          ) : (
            type === 'install' ? (
              <>{t('install_heading')} <span className="text-golden-yellow">{t('install_accent')}</span></>
            ) : (
              <>{t('general_heading')} <span className="text-golden-yellow">{t('general_accent')}</span></>
            )
          )}
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {isEmergency
            ? t('emergency_desc')
            : isContractor
            ? t('contractor_desc')
            : t('general_desc')
          }
        </p>
      </div>
    </section>
  );
}
