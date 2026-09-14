import React from 'react';
import Link from '@/shared/ui/Link';
import { getTranslations } from '@/lib/server-translations';
import { BUSINESS, TEL_HREF } from '@/lib/seo/site';
import { LogoMark } from '@/shared/layout/LogoMark';

/**
 * Home hero. A server component: it only needs translations, so it no longer
 * ships or hydrates JavaScript.
 *
 * - One h1 (the contractor panel is now an h2 in the same section).
 * - id="repair" is the target of the services cards' existing "#repair" link,
 *   which previously pointed at no element.
 * - No entrance animation: an element at opacity 0 isn't an LCP candidate.
 * - Links keep their destinations: /contact?type=repair, /diagnose, /portfolio, /login.
 * - No "Rated #1" line: Tobias confirmed the ranking isn't real (copy.md §2).
 */
const Hero = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'hero' });

  return (
    <section id="repair" className="hero surface-light" aria-labelledby="hero-title">
      <div className="wrap wrap--wide">
        <div className="split split--center">
          <div className="stack" style={{ '--stack-space': 'var(--space-s)' } as React.CSSProperties}>
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1 id="hero-title" className="display">{t('title')}</h1>
            <div className="hero__rule" aria-hidden="true"></div>
            <p className="lead">{t('lead')}</p>
            <p className="muted">
              <strong>{t('emergency_badge')}.</strong> {t('left_desc')}
            </p>
            <div className="hero__actions">
              <a href={TEL_HREF} className="button">
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('call', { phone: BUSINESS.phoneDisplay })}
              </a>
              <Link href="/contact?type=repair" className="button button--secondary">
                {t('request_service')}
              </Link>
            </div>
            <div className="hero__note">
              <span>{t('wait_time')}</span>
              <Link href="/diagnose" className="text-link">{t('ai_diagnosis')}</Link>
            </div>
          </div>

          <aside className="proof-card stack" aria-label={t('proof_label')}>
            <LogoMark className="proof-card__mark" variant="feature" priority />
            <ul className="badge-list">
              <li className="chip chip--accent">{t('since_badge')}</li>
            </ul>
            <div className="stack" style={{ '--stack-space': 'var(--space-2xs)' } as React.CSSProperties}>
              <p className="eyebrow">{t('areas_heading')}</p>
              <ul className="area-list">
                {BUSINESS.serviceAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="builders-panel surface-tint">
          <div className="stack" style={{ '--stack-space': 'var(--space-2xs)' } as React.CSSProperties}>
            <p className="eyebrow">{t('contractor_eyebrow')}</p>
            <h2 className="title-3">{t('contractor_title')}</h2>
            <p className="muted">{t('right_desc')}</p>
          </div>
          <div className="cluster">
            <Link href="/portfolio" className="button">{t('view_catalog')}</Link>
            <Link href="/login" className="text-link">{t('builder_portal')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
