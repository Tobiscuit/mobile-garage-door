import type { Metadata } from 'next'
import { Outfit, Inter } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mobile Garage Door - The Universal Garage Door Index',
  description: 'Access the precision-engineered database of garage door specifications. System nominal. Instant-View enabled.',
  keywords: ['garage door index', 'specifications', 'database', 'smart home', 'techno-hero'],
  authors: [{ name: 'Mobile Garage Door Systems' }],
  creator: 'Mobile Garage Door',
  publisher: 'Mobile Garage Door',
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
    url: 'https://mobile-garage-door.tech',
    title: 'Mobile Garage Door - The Universal Garage Door Index',
    description: 'Access the precision-engineered database of garage door specifications. System nominal. Instant-View enabled.',
    siteName: 'Mobile Garage Door',
    images: [
      {
        url: '/images/social/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mobile Garage Door System Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobile Garage Door - The Universal Garage Door Index',
    description: 'Access the precision-engineered database of garage door specifications. System nominal. Instant-View enabled.',
    images: ['/images/social/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-inter bg-charcoal-deep text-white antialiased selection:bg-brand-yellow selection:text-charcoal-deep`}>
        {children}
      </body>
    </html>
  )
}
