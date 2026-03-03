
import React from 'react'
import Header from '@/shared/layout/Header'
import Footer from '@/shared/layout/Footer'
import ScrollSaver from '@/shared/layout/ScrollSaver'
import PageTransition from '@/shared/layout/PageTransition'
import NextIntlProvider from '@/components/NextIntlProvider';
import { headers } from 'next/headers';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const reqHeaders = await headers();
  const locale = reqHeaders.get('x-next-intl-locale') || 'en';
  const messages = (await import(`../../../../messages/${locale}.json`)).default;

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
