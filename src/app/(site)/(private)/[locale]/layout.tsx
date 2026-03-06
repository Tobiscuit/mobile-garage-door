import NextIntlProvider from '@/components/NextIntlProvider';
import React from 'react';
import RootLayout from '../../(public)/(localized)/[locale]/root-layout';
export { metadata } from '../../(public)/(localized)/[locale]/root-layout';

// This layout provides the i18n context for private/admin routes 
// but DOES NOT include the public website header and footer.
export default async function PrivateLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const resolvedParams = (await params) || {};
    const locale = resolvedParams.locale || 'en';

    let messages: any = {};
    try {
        if (locale === 'es') {
            messages = (await import('../../../../../messages/es.json')).default;
        } else if (locale === 'vi') {
            messages = (await import('../../../../../messages/vi.json')).default;
        } else {
            messages = (await import('../../../../../messages/en.json')).default;
        }
    } catch (e) {
        console.warn(`Could not load messages for locale: ${locale}`);
    }

    return (
        <RootLayout params={params}>
            <NextIntlProvider messages={messages} locale={locale} timeZone="America/Chicago">
                {children}
            </NextIntlProvider>
        </RootLayout>
    );
}
