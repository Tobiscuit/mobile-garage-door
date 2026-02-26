import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // No /en/ prefix for English, only /es/ for Spanish
});
