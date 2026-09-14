import type { MetadataRoute } from 'next';
import { LOCALES, PRIVATE_PATH_PREFIXES, SITE_ORIGIN, localizedPath } from '@/lib/seo/site';

/**
 * /robots.txt (vinext requires this file at the app root).
 *
 * Everything public is crawlable. The auth-gated dashboard, portal and admin
 * areas are disallowed in every locale — spelled out per locale rather than
 * as `/*\/dashboard`, because robots paths are prefix matches and a wildcard
 * would also catch a future `/blog/dashboard-…` post.
 *
 * Not disallowed, on purpose: `/api/` (blog images are served from
 * /api/media/…, and Google says not to block resources pages need) and the
 * login and signup pages (a Disallow would hide any future noindex on them;
 * see specs/002-design-refresh/seo.md §4.7).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: LOCALES.flatMap((locale) => PRIVATE_PATH_PREFIXES.map((prefix) => localizedPath(locale, prefix))),
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
