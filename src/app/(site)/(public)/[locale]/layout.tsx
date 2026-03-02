import React from 'react'
import I18nProvider from '@/components/I18nProvider'
import { routing } from '@/i18n/routing'
import { notFound } from 'vinext/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  return (
    <I18nProvider locale={locale}>
      {children}
    </I18nProvider>
  )
}
