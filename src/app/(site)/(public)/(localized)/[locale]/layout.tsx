import React from 'react'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

import PublicLayout from './public-layout';
import RootLayout from './root-layout';
export { metadata } from './root-layout';

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
  const resolvedParams = (await params) || {};
  const locale = resolvedParams.locale || 'en';

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <RootLayout params={params}>
      <PublicLayout params={params}>
        {children}
      </PublicLayout>
    </RootLayout>
  );
}
