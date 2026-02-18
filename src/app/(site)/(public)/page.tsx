import React from 'react';
import Hero from '@/shared/layout/Hero';
import Services from '@/components/Services';
import TrustIndicators from '@/components/TrustIndicators';
import ValueStack from '@/components/ValueStack';
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
    <>
      <Hero />
      <Services services={services} />
      <ValueStack />
      <TrustIndicators testimonials={testimonials} />
    </>
  );
}
