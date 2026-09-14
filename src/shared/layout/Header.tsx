'use client'

import React, { useEffect, useId, useState } from 'react';
import Link from '@/shared/ui/Link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { authClient } from '@/lib/auth-client';
import { BUSINESS, TEL_HREF } from '@/lib/seo/site';
import { LogoMark } from '@/shared/layout/LogoMark';

const NAV_LINKS = [
  { path: '/services', key: 'services' },
  { path: '/portfolio', key: 'portfolio' },
  { path: '/blog', key: 'blog' },
  { path: '/about', key: 'about' },
] as const;

const PhoneIcon = () => (
  <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { data: session } = authClient.useSession();
  const menuId = useId();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => pathname === path || pathname.endsWith(path);

  const role = (session?.user as any)?.role;
  const isStaff = role === 'admin' || role === 'dispatcher' || role === 'technician';
  const isPortal = pathname.startsWith('/portal');

  const getDashboardUrl = () => {
    if (role === 'technician') return '/dashboard/technician';
    return '/dashboard'; // Admin & Dispatcher
  };

  // Escape closes the menu.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen]);

  const accountHref = session ? getDashboardUrl() : '/login';
  const accountLabel = session ? t('dashboard') : t('login');

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner wrap wrap--wide">
          <Link href="/" className="brand">
            <LogoMark className="brand__mark" />
            <span className="wordmark">
              <span className="wordmark__mobil">Mobil</span> Garage Door
            </span>
          </Link>

          <nav className="site-nav" aria-label={t('main_navigation')}>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="site-nav__link"
                    aria-current={isActive(link.path) ? 'page' : undefined}
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <a href={TEL_HREF} className="button button--secondary site-header__call">
              <PhoneIcon />
              {t('call', { phone: BUSINESS.phoneDisplay })}
            </a>
            <a href={TEL_HREF} className="icon-button icon-button--call">
              <PhoneIcon />
              <span className="visually-hidden">{t('call', { phone: BUSINESS.phoneDisplay })}</span>
            </a>
            <Link href="/contact" className="button site-header__request">
              {t('request_service')}
            </Link>
            {isStaff && isPortal ? (
              <Link href={getDashboardUrl()} className="site-header__account">
                {t('dashboard')}
              </Link>
            ) : (
              <Link href={accountHref} className="site-header__account">
                {accountLabel}
              </Link>
            )}
            <button
              type="button"
              className="icon-button icon-button--menu"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls={menuId}
              aria-label={isMobileMenuOpen ? t('menu_close') : t('menu_open')}
            >
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu: hidden and inert when closed, so its links are never tabbable off-screen. */}
      <div
        id={menuId}
        className="site-menu"
        data-open={isMobileMenuOpen ? 'true' : undefined}
        inert={!isMobileMenuOpen}
      >
        <div className="wrap">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  onClick={closeMobileMenu}
                  className="site-menu__link"
                  aria-current={isActive(link.path) ? 'page' : undefined}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="site-menu__actions">
            <a href={TEL_HREF} className="button button--block">
              <PhoneIcon />
              {t('call', { phone: BUSINESS.phoneDisplay })}
            </a>
            <Link href="/contact" onClick={closeMobileMenu} className="button button--secondary button--block">
              {t('request_service')}
            </Link>
            {(!isStaff || !isPortal) && (
              <Link href={accountHref} onClick={closeMobileMenu} className="button button--secondary button--block">
                {accountLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
