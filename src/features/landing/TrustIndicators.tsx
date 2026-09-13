import React from 'react';
import { getTranslations } from '@/lib/server-translations';

interface Testimonial {
  author: string;
  location: string;
  quote: string;
  rating: number;
}

interface TrustIndicatorsProps {
  locale: string;
  testimonials?: Testimonial[];
}

/**
 * Stats and customer testimonials. A server component now.
 *
 * The numbers are the same constants the site showed before (unverified —
 * copy.md §2, tier B). Removed, because the code proves them false: the
 * "System Online • Accepting Jobs" status, "real-time" framing, "In your area"
 * under a constant, and "ID: ####-VERIFIED" badges computed from the array
 * index. Testimonials come from the database, unchanged.
 */
const TrustIndicators = async ({ locale, testimonials = [] }: TrustIndicatorsProps) => {
  const t = await getTranslations({ locale, namespace: 'trust' });

  const stats = [
    { label: t('avg_response'), value: '58m', note: t('avg_response_diff') },
    { label: t('active_techs'), value: '3' },
    { label: t('projects_completed'), value: '842', note: t('this_year') },
    { label: t('satisfaction'), value: '100%', note: t('five_star') },
  ];

  return (
    <section className="section surface-light" aria-labelledby="numbers-heading">
      <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-l)' } as React.CSSProperties}>
        <div className="stack" style={{ '--stack-space': 'var(--space-xs)' } as React.CSSProperties}>
          <h2 id="numbers-heading" className="title-2">{t('title')}</h2>
          <p className="lead muted">{t('subtitle')}</p>
        </div>

        <dl className="stat-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <dt>{stat.label}</dt>
              <dd>
                <span className="stat__value">{stat.value}</span>
                {stat.note && <span className="stat__note">{stat.note}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div className="stack" style={{ '--stack-space': 'var(--space-m)' } as React.CSSProperties}>
          <h3 className="title-3">{t('testimonials_heading')}</h3>
          {testimonials.length > 0 ? (
            <ul className="testimonial-grid">
              {testimonials.map((testimonial, i) => (
                <li key={i} className="card">
                  <figure className="testimonial">
                    <div className="stars" role="img" aria-label={t('rating_label', { rating: testimonial.rating })}>
                      {Array.from({ length: testimonial.rating }).map((_, star) => (
                        <svg key={star} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <blockquote>
                      <p>&ldquo;{testimonial.quote}&rdquo;</p>
                    </blockquote>
                    <figcaption>
                      <span className="initials" aria-hidden="true">
                        {testimonial.author.split(' ').map((n) => n[0]).join('')}
                      </span>
                      <span>
                        <strong>{testimonial.author}</strong>
                        <br />
                        <span className="fine-print">{testimonial.location}</span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t('no_reviews')}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
