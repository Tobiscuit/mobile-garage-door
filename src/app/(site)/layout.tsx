import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mobile Garage Door - Your Trusted Partner for Garage Doors',
  description: 'Professional garage door services including repair, installation, and maintenance. Reliable and professional solutions for all your garage door needs.',
  keywords: ['garage door repair', 'garage door installation', 'garage door maintenance', 'mobile garage door service'],
  authors: [{ name: 'Mobile Garage Door' }],
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
    url: 'https://mobile-garage-door.vercel.app',
    title: 'Mobile Garage Door - Your Trusted Partner for Garage Doors',
    description: 'Professional garage door services including repair, installation, and maintenance. Reliable and professional solutions for all your garage door needs.',
    siteName: 'Mobile Garage Door',
    images: [
      {
        url: '/images/social/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mobile Garage Door - Professional Garage Door Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobile Garage Door - Your Trusted Partner for Garage Doors',
    description: 'Professional garage door services including repair, installation, and maintenance. Reliable and professional solutions for all your garage door needs.',
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
