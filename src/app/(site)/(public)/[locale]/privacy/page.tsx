import React from 'react';
import { getTranslations } from 'next-intl/server';

export default async function PrivacyPolicy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return (
    <main className="min-h-screen bg-white">
      
      <div className="pt-32 pb-24 px-6 container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black text-charcoal-blue mb-8">{t('title')}</h1>
        
        <div className="prose prose-lg text-steel-gray max-w-none">
          <p className="text-xl leading-relaxed mb-12">
            {t('intro')}
          </p>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">{t('section1_title')}</h2>
          <p>
            {t('section1_intro')}
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Identity Data:</strong> {t('identity_data')}</li>
            <li><strong>Location Data:</strong> {t('location_data')}</li>
            <li><strong>Financial Data:</strong> {t('financial_data')}</li>
            <li><strong>Technical Data:</strong> {t('technical_data')}</li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">{t('section2_title')}</h2>
          <p>
            {t('section2_intro')}
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Dispatching:</strong> {t('dispatching')}</li>
            <li><strong>Communication:</strong> {t('communication')}</li>
            <li><strong>Billing:</strong> {t('billing')}</li>
            <li><strong>Customer Service:</strong> {t('customer_service')}</li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">{t('section3_title')}</h2>
          <p>
            {t('section3_intro')}
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Square (Block, Inc.):</strong> {t('square')}</li>
            <li><strong>Google Maps Platform:</strong> {t('google_maps')}</li>
            <li><strong>Twilio / SendGrid:</strong> {t('twilio')}</li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">{t('section4_title')}</h2>
          <p className="mb-8">
            {t('section4_text')}
          </p>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">{t('section5_title')}</h2>
          <p className="mb-8">
            {t('section5_text')}
          </p>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">{t('section6_title')}</h2>
          <p className="mb-8">
            {t('section6_text')}
            <br />
            <strong>{t('last_updated')}</strong> February 14, 2026
          </p>

          <div className="bg-gray-50 p-8 rounded-2xl mt-12 border border-gray-100">
            <h3 className="text-lg font-bold text-charcoal-blue mb-2">{t('contact_title')}</h3>
            <p>
              {t('contact_text')} <a href="mailto:privacy@mobilegaragedoor.com" className="text-golden-yellow font-bold hover:underline">privacy@mobilegaragedoor.com</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
