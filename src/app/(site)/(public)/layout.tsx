
import React from 'react'
import Header from '@/shared/layout/Header'
import Footer from '@/shared/layout/Footer'
import ScrollSaver from '@/shared/layout/ScrollSaver'
import PageTransition from '@/shared/layout/PageTransition'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
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
    </NextIntlClientProvider>
  )
}


