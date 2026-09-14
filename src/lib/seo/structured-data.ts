import { BUSINESS, LOCALES, SITE_ORIGIN } from './site';

/**
 * schema.org JSON-LD for the public site.
 *
 * Only facts the pages show are marked up (Google: "Don't mark up content
 * that is not visible to readers of the page"), and only tier-A facts
 * (specs/002-design-refresh/copy.md §2). Deliberately absent, because the
 * site doesn't state them or they are unverified: address, geo, opening
 * hours, price range, ratings, reviews, sameAs, email. Also absent: licences,
 * insurance, memberships, accreditations and awards, which Tobias confirmed
 * the business doesn't hold (2026-09-14).
 * See specs/002-design-refresh/seo.md §4.5.
 */

export type JsonLdNode = Record<string, unknown>;

export const BUSINESS_ID = `${SITE_ORIGIN}/#business`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

/** Properties structured data must never carry on this site, whatever the input. */
export const FORBIDDEN_PROPERTIES = [
  'aggregateRating',
  'review',
  'priceRange',
  'openingHoursSpecification',
  'openingHours',
  'address',
  'geo',
  // Where licence, BBB, IDA and "#1" claims would go (schema.org Organization properties).
  'hasCredential',
  'hasCertification',
  'memberOf',
  'award',
] as const;

const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : `${SITE_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`);

const areaServed = () => BUSINESS.areaServed.map((name) => ({ '@type': 'Place', name }));

/** A reference to the business that stands on its own if a consumer doesn't resolve @id. */
const businessReference = () => ({
  '@type': 'HomeAndConstructionBusiness',
  '@id': BUSINESS_ID,
  name: BUSINESS.name,
  url: SITE_ORIGIN,
});

/**
 * The business. HomeAndConstructionBusiness is the most specific schema.org
 * type that applies: none of its subtypes (Electrician, GeneralContractor,
 * HVACBusiness, HousePainter, Locksmith, MovingCompany, Plumber,
 * RoofingContractor) covers garage doors.
 */
export function businessNode(description?: string): JsonLdNode {
  return {
    ...businessReference(),
    alternateName: BUSINESS.alternateName,
    logo: absolute(BUSINESS.logoPath),
    telephone: BUSINESS.phoneStructured,
    foundingDate: BUSINESS.foundingYear,
    areaServed: areaServed(),
    ...(description ? { description } : {}),
  };
}

/** Site name preference; Google reads it from the home page. */
export function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    url: SITE_ORIGIN,
    inLanguage: [...LOCALES],
    publisher: { '@id': BUSINESS_ID },
  };
}

export interface ServiceInput {
  title: string;
  description?: string | null;
}

/** One Service per service record, exactly as the page renders it. */
export function serviceNodes(services: ServiceInput[], pageUrl: string): JsonLdNode[] {
  return services
    .filter((service) => service.title)
    .map((service) => ({
      '@type': 'Service',
      name: service.title,
      ...(service.description ? { description: service.description } : {}),
      provider: businessReference(),
      areaServed: areaServed(),
      url: pageUrl,
    }));
}

export interface BlogPostingInput {
  headline: string;
  description?: string | null;
  imageUrl?: string | null;
  datePublished?: string | null;
  url: string;
  locale: string;
}

export function blogPostingNode(post: BlogPostingInput): JsonLdNode {
  return {
    '@type': 'BlogPosting',
    headline: post.headline,
    ...(post.description ? { description: post.description } : {}),
    ...(post.imageUrl ? { image: absolute(post.imageUrl) } : {}),
    ...(post.datePublished ? { datePublished: post.datePublished } : {}),
    author: { '@type': 'Organization', name: BUSINESS.name, url: SITE_ORIGIN },
    publisher: { ...businessReference(), logo: absolute(BUSINESS.logoPath) },
    mainEntityOfPage: post.url,
    inLanguage: post.locale,
  };
}

export function graph(nodes: JsonLdNode[]): JsonLdNode {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/**
 * JSON for a <script type="application/ld+json">. JSON.stringify doesn't
 * escape "<", so record text containing "</script>" could break out of the
 * tag; Next.js's JSON-LD guide replaces it with its < escape.
 */
export function serializeJsonLd(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
