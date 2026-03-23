import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Hero from '@/shared/layout/Hero';
import Services from '@/features/landing/Services';
import TrustIndicators from '@/features/landing/TrustIndicators';
import ValueStack from '@/features/landing/ValueStack';
import { getDB } from "@/db";
import { services as servicesTable, testimonials as testimonialsTable, serviceFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@/lib/cloudflare";
import { withTranslations } from "@/db/helpers";
import { getSessionSafe } from '@/lib/get-session-safe';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = (await params) || { locale: 'en' } as any;
  const locale = resolvedParams.locale || 'en';

  // Redirect returning logged-in users to their appropriate destination
  let headerList = new Headers();
  try { headerList = await headers(); } catch {}
  const session = await getSessionSafe(headerList);
  if (session?.user) {
    const role = (session.user as any)?.role;
    if (role === 'admin' || role === 'dispatcher') {
      redirect('/dashboard');
    }
    if (role === 'technician') {
      redirect('/dashboard/technician');
    }
    if (role === 'customer') {
      redirect('/portal');
    }
  }

  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  let services: any[] = [];
  let testimonials: any[] = [];

  if (db) {
    const rawServices = await db.select().from(servicesTable).orderBy(servicesTable.order);
    const allFeatures = await db.select().from(serviceFeatures);
    
    const servicesWithFeatures = rawServices.map((s: any) => ({
      ...s,
      features: allFeatures.filter((f: any) => f.serviceId === s.id)
    }));

    const rawTestimonials = await db.select().from(testimonialsTable).where(eq(testimonialsTable.featured, true));
    services = await withTranslations(env.DB, servicesWithFeatures, 'services', locale);
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
