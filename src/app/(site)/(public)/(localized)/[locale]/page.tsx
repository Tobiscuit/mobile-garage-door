import React from 'react';
import Hero from '@/shared/layout/Hero';
import Services from '@/features/landing/Services';
import TrustIndicators from '@/features/landing/TrustIndicators';
import ValueStack from '@/features/landing/ValueStack';
import { getDB } from "@/db";
import { services as servicesTable, testimonials as testimonialsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@/lib/cloudflare";
import { withTranslations } from "@/db/helpers";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = (await params) || { locale: 'en' } as any;
  const locale = resolvedParams.locale || 'en';
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  let services: any[] = [];
  let testimonials: any[] = [];

  if (db) {
    const rawServices = await db.select().from(servicesTable).orderBy(servicesTable.order);
    const rawTestimonials = await db.select().from(testimonialsTable).where(eq(testimonialsTable.featured, true));
    services = await withTranslations(env.DB, rawServices, 'services', locale);
    testimonials = await withTranslations(env.DB, rawTestimonials, 'testimonials', locale);
  }

  return (
    <>
      <Hero />
      <Services services={services as any} />
      <ValueStack />
      <TrustIndicators testimonials={testimonials as any} />
    </>
  );
}
