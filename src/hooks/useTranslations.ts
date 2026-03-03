'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * Client-side translation hook for use in Client Components.
 * Wraps next-intl's useTranslations hook to maintain the same API signature
 * previously used across the codebase.
 */
export function useTranslations(namespace?: string) {
  const t = useNextIntlTranslations(namespace);

  return (key: string, values?: any) => {
    return t(key, values);
  };
}
