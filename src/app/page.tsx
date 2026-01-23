import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import TrustIndicators from '@/components/TrustIndicators';
import ValueStack from '@/components/ValueStack';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-primary">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services />
        <ValueStack />
        <TrustIndicators />
      </main>
      <Footer />
    </div>
  );
}
