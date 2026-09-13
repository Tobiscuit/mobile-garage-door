import { describe, expect, it } from 'vitest';
import { pageMetadata } from './metadata';
import { SITE_ORIGIN } from './site';

describe('pageMetadata', () => {
  it('builds a unique localized title, canonical, hreflang and Open Graph for a page', async () => {
    const metadata = await pageMetadata({
      locale: 'es',
      path: '/services',
      title: { key: 'services_title' },
      description: { key: 'services_description' },
    });

    expect(metadata.title).toEqual({ absolute: 'Servicios de puertas de garaje: resortes, abridores y puertas nuevas | Mobil Garage Door' });
    expect(metadata.description).toMatch(/^Reparación de resortes/);
    expect(metadata.alternates?.canonical).toBe(`${SITE_ORIGIN}/es/services`);
    expect(metadata.alternates?.languages).toEqual({
      en: `${SITE_ORIGIN}/services`,
      es: `${SITE_ORIGIN}/es/services`,
      vi: `${SITE_ORIGIN}/vi/services`,
      'x-default': `${SITE_ORIGIN}/services`,
    });
    expect(metadata.openGraph).toMatchObject({
      url: `${SITE_ORIGIN}/es/services`,
      locale: 'es_US',
      type: 'website',
      siteName: 'Mobil Garage Door',
      title: 'Servicios de puertas de garaje: resortes, abridores y puertas nuevas',
    });
    expect(metadata.keywords).toBeNull();
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it('formats the home canonical like vinext (no trailing slash) and interpolates values', async () => {
    const metadata = await pageMetadata({
      locale: 'en',
      path: '/',
      title: { key: 'home_title' },
      description: { key: 'home_description', values: { phone: '832-419-1293' } },
    });
    expect(metadata.alternates?.canonical).toBe(SITE_ORIGIN);
    expect(metadata.description).toContain('Call 832-419-1293');
  });

  it('uses record text as-is and can mark a page noindex', async () => {
    const metadata = await pageMetadata({
      locale: 'vi',
      path: '/blog/a-draft',
      title: { text: 'A draft' },
      description: { text: 'Draft summary' },
      type: 'article',
      noindex: true,
    });
    expect(metadata.title).toEqual({ absolute: 'A draft | Mobil Garage Door' });
    expect(metadata.alternates?.canonical).toBe(`${SITE_ORIGIN}/vi/blog/a-draft`);
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.openGraph).toMatchObject({ type: 'article', locale: 'vi_US' });
  });

  it('declares the default social image with its real dimensions', async () => {
    const metadata = await pageMetadata({ locale: 'en', path: '/about', title: { key: 'about_title' }, description: { key: 'about_description' } });
    const images = metadata.openGraph?.images as Array<Record<string, unknown>>;
    expect(images[0]).toMatchObject({ url: '/images/social/og-default.jpg', width: 1200, height: 630, alt: 'Mobil Garage Door logo' });
  });
});
