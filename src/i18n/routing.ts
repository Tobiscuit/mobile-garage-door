import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'es', 'vi'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Only add a prefix to non-default locales (es, vi)
    localePrefix: 'as-needed'
});

export type Locale = (typeof routing.locales)[number];
