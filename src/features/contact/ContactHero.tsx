'use client';
import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface ContactHeroProps {
  type: 'repair' | 'install' | 'contractor' | 'general';
}

/** The request page's h1, varying with ?type= exactly as before. */
export function ContactHero({ type }: ContactHeroProps) {
  const t = useTranslations('contact_hero');
  const isEmergency = type === 'repair';
  const isContractor = type === 'contractor';

  const heading = isEmergency
    ? t('emergency_heading')
    : isContractor
      ? t('contractor_heading')
      : type === 'install'
        ? t('install_heading')
        : t('general_heading');

  const badge = isEmergency ? t('emergency_badge') : isContractor ? t('contractor_badge') : t('consultation_badge');

  return (
    <section className={`section section--snug ${isEmergency ? 'surface-red' : 'surface-light'}`} aria-labelledby="request-title">
      <div className="wrap wrap--wide stack">
        <p className="eyebrow">{badge}</p>
        <h1 id="request-title" className="title-1">{heading}</h1>
        <p className="lead">
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
