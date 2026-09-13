import React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from '@/lib/server-translations';
import { pageMetadata } from '@/lib/seo/metadata';
import { formatDate } from '@/lib/seo/dates';

/** The date the policy text was last changed (unchanged by this redesign). */
const POLICY_LAST_UPDATED = '2026-02-14';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = (await params) || { locale: 'en' };
  return pageMetadata({
    locale,
    path: '/privacy',
    title: { key: 'privacy_title' },
    description: { key: 'privacy_description' },
  });
}

export default async function PrivacyPolicy({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = (await params) || { locale: 'en' } as any;
  const locale = resolvedParams.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return (
    <div className="page">
      <article className="section section--snug" aria-labelledby="privacy-title">
        <div className="wrap legal stack">
          <h1 id="privacy-title" className="title-1">{t('title')}</h1>
          <p className="lead">{t('intro')}</p>

          <h2>{t('section1_title')}</h2>
          <p>{t('section1_intro')}</p>
          <ul>
            <li><strong>{t('identity_label')}:</strong> {t('identity_data')}</li>
            <li><strong>{t('location_data_label')}:</strong> {t('location_data')}</li>
            <li><strong>{t('financial_label')}:</strong> {t('financial_data')}</li>
            <li><strong>{t('technical_label')}:</strong> {t('technical_data')}</li>
          </ul>

          <h2>{t('section2_title')}</h2>
          <p>{t('section2_intro')}</p>
          <ul>
            <li><strong>{t('dispatching_label')}:</strong> {t('dispatching')}</li>
            <li><strong>{t('communication_label')}:</strong> {t('communication')}</li>
            <li><strong>{t('billing_label')}:</strong> {t('billing')}</li>
            <li><strong>{t('customer_service_label')}:</strong> {t('customer_service')}</li>
          </ul>

          <h2>{t('section3_title')}</h2>
          <p>{t('section3_intro')}</p>
          <ul>
            <li><strong>Square (Block, Inc.):</strong> {t('square')}</li>
            <li><strong>Google Maps Platform:</strong> {t('google_maps')}</li>
            <li><strong>Twilio / SendGrid:</strong> {t('twilio')}</li>
          </ul>

          <h2>{t('section4_title')}</h2>
          <p>{t('section4_text')}</p>

          <h2>{t('section5_title')}</h2>
          <p>{t('section5_text')}</p>

          <h2>{t('section6_title')}</h2>
          <p>{t('section6_text')}</p>
          <p>
            <strong>{t('last_updated')}</strong>{' '}
            <time dateTime={POLICY_LAST_UPDATED}>{formatDate(POLICY_LAST_UPDATED, locale)}</time>
          </p>

          <section className="card stack" aria-labelledby="privacy-contact">
            <h2 id="privacy-contact" className="title-4">{t('contact_title')}</h2>
            <p>
              {t('contact_text')}{' '}
              <a href="mailto:privacy@mobilegaragedoor.com" className="text-link">privacy@mobilegaragedoor.com</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
