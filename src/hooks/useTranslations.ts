'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';

export function useTranslations(namespace?: string) {
  const { t } = useI18nTranslation();

  return (key: string, values?: any) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey, values);
  };
}
