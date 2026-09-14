import { resolveLocale, type Locale } from './site';

/** BCP 47 tags for date formatting: the site's audience is in the US in every language. */
const DATE_LOCALE: Record<Locale, string> = { en: 'en-US', es: 'es-US', vi: 'vi-VN' };

/**
 * A human date in the page's language. Stored dates are ISO strings; UTC keeps
 * a date-only value such as "2026-01-01" on the same day whatever the server's
 * time zone.
 */
export function formatDate(value: string | null | undefined, locale: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(DATE_LOCALE[resolveLocale(locale)], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** The machine-readable form for <time dateTime>. */
export function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
