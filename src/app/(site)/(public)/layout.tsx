
import React from 'react'
import Header from '@/shared/layout/Header'
import Footer from '@/shared/layout/Footer'
import ScrollSaver from '@/shared/layout/ScrollSaver'
import PageTransition from '@/shared/layout/PageTransition'

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
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
