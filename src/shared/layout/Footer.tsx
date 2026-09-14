import React from 'react';
import { getTranslations } from '@/lib/server-translations';
import { BUSINESS, TEL_HREF } from '@/lib/seo/site';

/**
 * Site footer, in the page's locale (it used to call getTranslations('footer')
 * without a locale, which always resolved to English).
 *
 * Every link here existed before or points at a page in the main navigation.
 * The service areas are plain text now: they were href="#" links to nowhere.
 * A fifth column used to hold a state licence number and an insurer that Tobias
 * confirmed aren't real. It's gone; the brand column now carries what is true:
 * the 24/7 emergency line above the phone link (specs/002-design-refresh/copy.md §2).
 */
const Footer = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'footer' });

  return (
    <footer className="site-footer surface-deep">
      <div className="wrap wrap--wide">
        <div className="site-footer__grid">
          <div className="site-footer__brand stack">
            <p className="wordmark">
              <span className="wordmark__mobil">Mobil</span> Garage Door
            </p>
            <p>{t('brand_description')}</p>
            <div className="site-footer__emergency">
              <h2 className="site-footer__heading">{t('emergency_heading')}</h2>
              <a className="site-footer__call text-link" href={TEL_HREF}>
                {t('call', { phone: BUSINESS.phoneDisplay })}
              </a>
            </div>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="site-footer__heading">{t('explore')}</h2>
            <ul className="site-footer__list">
              <li><a href="/services">{t('nav_services')}</a></li>
              <li><a href="/portfolio">{t('nav_projects')}</a></li>
              <li><a href="/blog">{t('nav_blog')}</a></li>
              <li><a href="/about">{t('nav_about')}</a></li>
              <li><a href="/contact">{t('nav_contact')}</a></li>
            </ul>
          </nav>

          <div>
            <h2 className="site-footer__heading">{t('deployment_zones')}</h2>
            <ul className="site-footer__list site-footer__areas">
              {BUSINESS.serviceAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
              <li>{t('areas_note')}</li>
            </ul>
          </div>

          <nav aria-labelledby="footer-support">
            <h2 id="footer-support" className="site-footer__heading">{t('client_support')}</h2>
            <ul className="site-footer__list">
              <li><a href="/contact">{t('warranty_claim')}</a></li>
              <li><a href="/login">{t('builder_portal')}</a></li>
              <li><a href="/contact?type=repair">{t('emergency_callback')}</a></li>
            </ul>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          <a className="text-link" href="/privacy">{t('privacy_policy')}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
