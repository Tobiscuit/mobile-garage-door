import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { getLocale } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Mobil Garage Door - Your Trusted Partner for Garage Doors',
  description: 'Professional garage door services including repair, installation, and maintenance. Reliable and professional solutions for all your garage door needs.',
  keywords: ['garage door repair', 'garage door installation', 'garage door maintenance', 'mobil garage door service'],
  authors: [{ name: 'Mobil Garage Door' }],
  creator: 'Mobil Garage Door',
  publisher: 'Mobil Garage Door',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mobil-garage-door.vercel.app',
    title: 'Mobil Garage Door - Your Trusted Partner for Garage Doors',
    description: 'Professional garage door services including repair, installation, and maintenance. Reliable and professional solutions for all your garage door needs.',
    siteName: 'Mobil Garage Door',
    images: [
      {
        url: '/images/social/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mobil Garage Door - Professional Garage Door Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobil Garage Door - Your Trusted Partner for Garage Doors',
    description: 'Professional garage door services including repair, installation, and maintenance. Reliable and professional solutions for all your garage door needs.',
    images: ['/images/social/og-image.png'],
  },
  alternates: {
    languages: {
      en: '/',
      es: '/es',
    },
  },
}

import { FloatingAiButton } from '@/features/landing/FloatingAiButton';
import { PwaRegistry } from '@/components/PwaRegistry';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-primary`}>
        {children}
        <FloatingAiButton />
        <PwaRegistry />
      </body>
    </html>
  )
}

