import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate the incoming locale against supported locales
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    let messages: any;
    if (locale === 'es') {
        messages = (await import('../../messages/es.json')).default;
    } else if (locale === 'vi') {
        messages = (await import('../../messages/vi.json')).default;
    } else {
        messages = (await import('../../messages/en.json')).default;
    }

    return {
        locale,
        messages,
        // Set a default timezone (can be made dynamic later)
        timeZone: 'America/Chicago'
    };
});
