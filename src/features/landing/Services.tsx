import React from 'react';
import { getTranslations } from '@/lib/server-translations';

interface ServiceFeature {
  feature: string;
}

interface Service {
  title: string;
  slug: string;
  category: string;
  description: string;
  highlight?: boolean | null;
  icon: 'lightning' | 'building' | 'clipboard' | 'phone';
  features?: ServiceFeature[] | null;
}

interface ServicesProps {
  locale: string;
  services?: Service[];
}

const IconMap = {
  lightning: (
    <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  building: (
    <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  clipboard: (
    <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  phone: (
    <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

/**
 * Home page services, from the database. A server component now (it only
 * needed translations). Each card keeps exactly five children so the cards
 * can share row tracks through subgrid in a wide slot (site.css .service-card).
 * Link destinations are unchanged, including "#repair", which now resolves to
 * the hero section.
 */
const Services = async ({ locale, services = [] }: ServicesProps) => {
  const t = await getTranslations({ locale, namespace: 'services_landing' });

  return (
    <section id="services" className="section surface-tint" aria-labelledby="services-heading">
      <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-l)' } as React.CSSProperties}>
        <div className="stack" style={{ '--stack-space': 'var(--space-xs)' } as React.CSSProperties}>
          <h2 id="services-heading" className="title-2">{t('heading')}</h2>
          <p className="lead muted">{t('subheading')}</p>
        </div>

        <div className="card-grid">
          <ul className="card-grid__list">
            {services.map((service) => {
              const isHighPriority = service.category === 'Critical Response';
              const href = service.slug === 'contractor-portal'
                ? '/contact?type=contractor'
                : (service.slug === 'installations' ? '/portfolio' : '#repair');
              const label = service.slug === 'contractor-portal'
                ? t('cta_portal')
                : (service.slug === 'installations' ? t('cta_gallery') : t('cta_emergency'));

              return (
                <li
                  key={service.slug}
                  className={`service-card${isHighPriority ? ' service-card--priority' : ''}${service.highlight ? ' service-card--featured' : ''}`}
                >
                  <div className="service-card__head">
                    <span className="service-card__icon">{IconMap[service.icon] || IconMap.lightning}</span>
                    {isHighPriority ? <span className="chip chip--accent">{t('high_priority')}</span> : <span />}
                  </div>
                  <h3 className="service-card__title">{service.title}</h3>
                  <p className="muted">{service.description}</p>
                  <ul className="feature-list">
                    {(service.features || []).map((f, idx) => (
                      <li key={idx}>{f.feature}</li>
                    ))}
                  </ul>
                  <a href={href} className="service-card__cta text-link">
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Services;
