import { routing } from '@/i18n/routing';

/**
 * Site identity and URL rules shared by metadata, JSON-LD, the sitemap, robots
 * and the page chrome, so a URL or a business fact is written exactly once.
 *
 * Every business fact here is one the site already states and that Tobias set
 * deliberately — see specs/002-design-refresh/copy.md §2 (tier A) for the
 * commit behind each. Nothing unconfirmed belongs in this file.
 */

/** Production origin: the canonical host (www 301s here). */
export const SITE_ORIGIN = 'https://mobilgaragedoor.com';

export type Locale = (typeof routing.locales)[number];
export const LOCALES: readonly Locale[] = routing.locales;
export const DEFAULT_LOCALE: Locale = routing.defaultLocale;

export const BUSINESS = {
  name: 'Mobil Garage Door',
  /** The header wordmark and the installed app title. */
  alternateName: 'Mobil Garage',
  /** Shown on the contact page and in the blog call-to-action; set in commit 18ad1a7. */
  phoneDisplay: '832-419-1293',
  /** RFC 3966 global form, for tel: links. */
  phoneE164: '+18324191293',
  /** Schema.org telephone, with country and area code as Google recommends. */
  phoneStructured: '+1-832-419-1293',
  /** "Since 2000" (commit d351bd7). */
  foundingYear: '2000',
  /** 1200×896 on a white background; ≥ 112px as Google requires for logos. */
  logoPath: '/images/logos/logo.jpg',
  /** The footer's service areas, verbatim (commit eba7e4b). Place names are not translated. */
  serviceAreas: [
    'Greater Katy & West Houston',
    'The Woodlands & North Houston',
    'Sugar Land & Richmond',
    'Houston Interior & Heights',
  ],
  /** The places those service areas name, for schema.org areaServed. */
  areaServed: ['Houston, TX', 'Katy, TX', 'The Woodlands, TX', 'Sugar Land, TX', 'Richmond, TX'],
} as const;

export const TEL_HREF = `tel:${BUSINESS.phoneE164}`;

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * The pathname next-intl serves a page at. The routing uses
 * `localePrefix: 'as-needed'`: the default locale is unprefixed, every other
 * locale is prefixed (a unit test pins that assumption to the routing config).
 */
export function localizedPath(locale: Locale, path: string): string {
  const normalized = path === '/' ? '' : path.replace(/\/+$/, '');
  if (locale === DEFAULT_LOCALE) return normalized || '/';
  return `/${locale}${normalized}`;
}

/**
 * Absolute production URL for a pathname, formatted the way vinext resolves
 * `alternates.canonical` (the site root has no trailing slash), so the
 * canonical, og:url, hreflang, sitemap <loc> and JSON-LD url are one string.
 */
export function absoluteUrl(pathname: string): string {
  return pathname === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${pathname}`;
}

/** The reciprocal hreflang cluster for a page: every locale plus x-default (the default locale). */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[locale] = absoluteUrl(localizedPath(locale, path));
  languages['x-default'] = absoluteUrl(localizedPath(DEFAULT_LOCALE, path));
  return languages;
}

/** og:locale is language_TERRITORY. The site's audience is in the US in all three languages. */
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_US', vi: 'vi_US' };

export function blogPostPath(slug: string): string {
  return `/blog/${encodeURIComponent(slug)}`;
}

export function projectPath(slug: string): string {
  return `/portfolio/${encodeURIComponent(slug)}`;
}

/** Public pages that exist in every locale, in navigation order. */
export const PUBLIC_PAGE_PATHS = ['/', '/services', '/portfolio', '/blog', '/about', '/contact', '/privacy'] as const;

/** Auth-gated areas kept out of crawling (robots.txt), in every locale. */
export const PRIVATE_PATH_PREFIXES = ['/dashboard', '/portal', '/admin'] as const;
