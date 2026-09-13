import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import robots from '@/app/robots';
import {
  LOCALES,
  SITE_ORIGIN,
  absoluteUrl,
  blogPostPath,
  languageAlternates,
  localizedPath,
  resolveLocale,
} from './site';

describe('i18n routing assumptions the SEO URLs depend on', () => {
  it('serves en unprefixed and es/vi under their prefix', () => {
    // localizedPath() mirrors next-intl's "as-needed" prefixing. If routing
    // changes, canonicals and hreflang would silently point at the wrong URLs.
    expect(routing.localePrefix).toBe('as-needed');
    expect(routing.defaultLocale).toBe('en');
    expect([...routing.locales]).toEqual(['en', 'es', 'vi']);
  });
});

describe('localizedPath', () => {
  it.each([
    ['en', '/', '/'],
    ['es', '/', '/es'],
    ['vi', '/', '/vi'],
    ['en', '/services', '/services'],
    ['es', '/services', '/es/services'],
    ['vi', '/blog/a-post', '/vi/blog/a-post'],
    ['es', '/about/', '/es/about'],
  ] as const)('%s %s → %s', (locale, path, expected) => {
    expect(localizedPath(locale, path)).toBe(expected);
  });
});

describe('absoluteUrl', () => {
  it('formats the root without a trailing slash, as vinext resolves canonicals', () => {
    expect(absoluteUrl('/')).toBe(SITE_ORIGIN);
    expect(absoluteUrl('/es/services')).toBe(`${SITE_ORIGIN}/es/services`);
  });
});

describe('languageAlternates', () => {
  it('lists every locale plus x-default, pointing x-default at English', () => {
    const alternates = languageAlternates('/services');
    expect(alternates).toEqual({
      en: `${SITE_ORIGIN}/services`,
      es: `${SITE_ORIGIN}/es/services`,
      vi: `${SITE_ORIGIN}/vi/services`,
      'x-default': `${SITE_ORIGIN}/services`,
    });
  });

  it('is identical from every language version of a page (reciprocal)', () => {
    const fromEnglish = languageAlternates('/');
    for (const locale of LOCALES) {
      // Each localized page lists itself…
      expect(Object.values(fromEnglish)).toContain(absoluteUrl(localizedPath(locale, '/')));
    }
    // …and every version is built from the same locale-independent path.
    expect(languageAlternates('/')).toEqual(fromEnglish);
  });

  it('encodes slugs in content paths', () => {
    expect(blogPostPath('a b')).toBe('/blog/a%20b');
  });
});

describe('resolveLocale', () => {
  it('falls back to the default locale for unknown values', () => {
    expect(resolveLocale('fr')).toBe('en');
    expect(resolveLocale(undefined)).toBe('en');
    expect(resolveLocale('vi')).toBe('vi');
  });
});

describe('robots', () => {
  const config = robots();
  const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
  const disallow = rules.flatMap((rule) => (Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow ?? []].flat()));

  it('allows everything public and names the sitemap with an absolute URL', () => {
    expect(rules[0].userAgent).toBe('*');
    expect(rules[0].allow).toBe('/');
    expect(config.sitemap).toBe(`${SITE_ORIGIN}/sitemap.xml`);
  });

  it('disallows the dashboard, portal and admin areas in every locale', () => {
    for (const path of ['/dashboard', '/portal', '/admin', '/es/dashboard', '/es/portal', '/vi/dashboard', '/vi/portal']) {
      expect(disallow).toContain(path);
    }
  });

  it("doesn't block blog images, auth pages or public pages", () => {
    for (const path of ['/api/', '/api/media', '/login', '/signup', '/blog', '/services']) {
      expect(disallow).not.toContain(path);
    }
  });
});
