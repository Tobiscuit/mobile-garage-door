import React from 'react';
import Hero from '@/shared/layout/Hero';
import Services from '@/features/landing/Services';
import TrustIndicators from '@/features/landing/TrustIndicators';
import ValueStack from '@/features/landing/ValueStack';
import { getDB } from "@/db";
import { services as servicesTable, testimonials as testimonialsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "vinext/cloudflare";
import { withTranslations } from "@/db/helpers";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  const rawServices = await db.select().from(servicesTable).orderBy(servicesTable.order);
  const rawTestimonials = await db.select().from(testimonialsTable).where(eq(testimonialsTable.featured, true));

  const services = await withTranslations(env.DB, rawServices, 'services', locale);
  const testimonials = await withTranslations(env.DB, rawTestimonials, 'testimonials', locale);

  return (
    <>
      <Hero />
      <Services services={services as any} />
      <ValueStack />
      <TrustIndicators testimonials={testimonials as any} />
    </>
  );
}
