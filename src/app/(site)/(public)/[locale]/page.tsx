import React from 'react';
import Hero from '@/shared/layout/Hero';
import Services from '@/features/landing/Services';
import TrustIndicators from '@/features/landing/TrustIndicators';
import ValueStack from '@/features/landing/ValueStack';
import Testimonials from '@/features/landing/Testimonials';
import ProjectCardImage from '@/features/landing/ProjectCardImage';
import ProjectHeroImage from '@/features/landing/ProjectHeroImage';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const payload = await getPayload({ config: configPromise });
  
  const { docs: services } = await payload.find({
    collection: 'services',
    sort: 'order',
    locale: locale as 'en' | 'es',
  });

  const { docs: testimonials } = await payload.find({
    collection: 'testimonials',
    where: {
      featured: {
        equals: true,
      },
    },
    locale: locale as 'en' | 'es',
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
