import React from 'react';
import { getTranslations } from '@/lib/server-translations';
import { BUSINESS, TEL_HREF } from '@/lib/seo/site';

/**
 * Phones only (hidden from 48em by CSS): call and request service, fixed in
 * the thumb zone. The two links go where the header's actions go. Hidden on
 * the request form itself, which marks its form with data-request-form.
 */
const MobileActionBar = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <nav className="action-bar" aria-label={t('quick_actions')}>
      <a href={TEL_HREF} className="button button--secondary">
        <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        {t('call_short')}
        <span className="visually-hidden">{BUSINESS.phoneDisplay}</span>
      </a>
      <a href="/contact" className="button">
        {t('request_service')}
      </a>
    </nav>
  );
};

export default MobileActionBar;
