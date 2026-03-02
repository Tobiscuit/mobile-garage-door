'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Client-side translation hook for use in Client Components.
 * Wraps react-i18next's useTranslation hook.
 */
export function useTranslations(namespace?: string) {
  const { t } = useI18nTranslation();

  return (key: string, values?: any) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey, values);
  };
}
