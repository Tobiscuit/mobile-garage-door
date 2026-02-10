import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import TrustIndicators from '@/components/TrustIndicators';
import ValueStack from '@/components/ValueStack';
import Footer from '@/components/Footer';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export default async function Home() {
  const payload = await getPayload({ config: configPromise });
  
  const { docs: services } = await payload.find({
    collection: 'services',
    sort: 'order',
  });

  const { docs: testimonials } = await payload.find({
    collection: 'testimonials',
    where: {
      featured: {
        equals: true,
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-primary">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Services services={services} />
        <ValueStack />
        <TrustIndicators testimonials={testimonials} />
      </main>
      <Footer />
    </div>
  );
}
