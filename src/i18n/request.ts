import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate the incoming locale against supported locales
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    return {
        locale,
        // Provide the corresponding translations
        messages: (await import(`../../messages/${locale}.json`)).default,
        // Set a default timezone (can be made dynamic later)
        timeZone: 'America/Chicago'
    };
});
