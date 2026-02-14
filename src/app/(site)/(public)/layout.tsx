
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollSaver from '@/components/ScrollSaver'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-primary">
      <ScrollSaver />
      <Header />
      <main className="flex-grow relative">
        {children}
      </main>
      <Footer />
    </div>
  )
}
