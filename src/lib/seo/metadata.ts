import type { Metadata } from 'next';
import { getTranslations } from '@/lib/server-translations';
import {
  BUSINESS,
  OG_LOCALE,
  SITE_ORIGIN,
  absoluteUrl,
  languageAlternates,
  localizedPath,
  resolveLocale,
} from './site';

/** A string from the `seo` message namespace, or text taken from a record (a post title). */
export type SeoText = { key: string; values?: Record<string, string> } | { text: string };

export interface PageMetadataInput {
  locale: string | undefined;
  /** The locale-independent path, e.g. "/services" or "/blog/my-post". */
  path: string;
  title: SeoText;
  description: SeoText;
  type?: 'website' | 'article';
  image?: { url: string; width?: number; height?: number; alt: string };
  publishedTime?: string;
  noindex?: boolean;
}

export const DEFAULT_SOCIAL_IMAGE = {
  url: '/images/social/og-default.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
} as const;

/**
 * Complete metadata for one public page in one locale: a unique branded
 * title, description, self-referencing canonical, the reciprocal hreflang
 * cluster, Open Graph and Twitter, and robots.
 *
 * Every top-level key is set explicitly because metadata merges shallowly
 * (in Next.js and in vinext): a page's `openGraph` replaces the layout's.
 */
export async function pageMetadata(input: PageMetadataInput): Promise<Metadata> {
  const locale = resolveLocale(input.locale);
  const t = await getTranslations({ locale, namespace: 'seo' });
  const resolve = (text: SeoText) => ('text' in text ? text.text : t(text.key, text.values));

  const siteName = t('site_name');
  const title = resolve(input.title);
  const description = resolve(input.description);
  const url = absoluteUrl(localizedPath(locale, input.path));
  const image = input.image ?? { ...DEFAULT_SOCIAL_IMAGE, alt: t('og_image_alt') };

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: { absolute: `${title} | ${siteName}` },
    description,
    // Google Search doesn't use the keywords meta tag; clear the layout's.
    keywords: null,
    authors: [{ name: BUSINESS.name }],
    alternates: { canonical: url, languages: languageAlternates(input.path) },
    openGraph: {
      type: input.type ?? 'website',
      url,
      siteName,
      // Facebook: og:title without branding.
      title,
      description,
      locale: OG_LOCALE[locale],
      images: [image],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
    robots: input.noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        },
  };
}
