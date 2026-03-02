import en from '../../messages/en.json';
import es from '../../messages/es.json';
import vi from '../../messages/vi.json';

const messages: Record<string, Record<string, any>> = { en, es, vi };

/**
 * Server-side translation function for use in Server Components and server actions.
 * Mirrors the next-intl getTranslations API.
 *
 * Usage:
 *   const t = await getTranslations({ locale: 'es', namespace: 'services_page' });
 *   t('heading') // returns the translated value
 *
 * Also supports shorthand:
 *   const t = await getTranslations('footer');
 *   t('copyright')
 */
export async function getTranslations(
    optionsOrNamespace: string | { locale?: string; namespace?: string }
): Promise<(key: string, values?: Record<string, any>) => string> {
    let locale: string;
    let namespace: string | undefined;

    if (typeof optionsOrNamespace === 'string') {
        locale = 'en';
        namespace = optionsOrNamespace;
    } else {
        locale = optionsOrNamespace.locale || 'en';
        namespace = optionsOrNamespace.namespace;
    }

    const localeMessages = messages[locale] || messages['en'];

    return (key: string, values?: Record<string, any>): string => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const parts = fullKey.split('.');

        let value: any = localeMessages;
        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                // Fall back to English if key not found in target locale
                let fallback: any = messages['en'];
                for (const p of parts) {
                    if (fallback && typeof fallback === 'object' && p in fallback) {
                        fallback = fallback[p];
                    } else {
                        return fullKey; // Key not found anywhere
                    }
                }
                return typeof fallback === 'string' ? interpolate(fallback, values) : fullKey;
            }
        }

        return typeof value === 'string' ? interpolate(value, values) : fullKey;
    };
}

/**
 * Simple interpolation: replaces {name} with values.name
 */
function interpolate(template: string, values?: Record<string, any>): string {
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        return key in values ? String(values[key]) : `{${key}}`;
    });
}
