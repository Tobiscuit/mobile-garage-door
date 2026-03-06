
import React from 'react'
import Header from '@/shared/layout/Header'
import Footer from '@/shared/layout/Footer'
import ScrollSaver from '@/shared/layout/ScrollSaver'
import PageTransition from '@/shared/layout/PageTransition'
import NextIntlProvider from '@/components/NextIntlProvider';


export default async function PublicLayout({
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
      messages = (await import('../../../../../../messages/es.json')).default;
    } else if (locale === 'vi') {
      messages = (await import('../../../../../../messages/vi.json')).default;
    } else {
      messages = (await import('../../../../../../messages/en.json')).default;
    }
  } catch (err) {
    console.warn("Could not load public messages for locale:", locale, err);
  }

  return (
    <NextIntlProvider messages={messages} locale={locale} timeZone="America/Chicago">
      <div className="flex flex-col min-h-screen bg-background text-primary">
        <ScrollSaver />
        <Header />
        <main className="flex-grow relative">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
      </div>
    </NextIntlProvider>
  )
}
