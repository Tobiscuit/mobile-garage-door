import React from 'react';
import type { Metadata } from 'next';
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
import { getTranslations } from '@/lib/server-translations';
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/JsonLd';
import { absoluteUrl, localizedPath, resolveLocale, BUSINESS } from '@/lib/seo/site';
import { businessNode, graph, serviceNodes, websiteNode } from '@/lib/seo/structured-data';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = (await params) || { locale: 'en' };
  return pageMetadata({
    locale,
    path: '/',
    title: { key: 'home_title' },
    description: { key: 'home_description', values: { phone: BUSINESS.phoneDisplay } },
  });
}

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

  // Structured data describes what this page shows: the business (with the
  // hero's visible description), the site, and each service card as rendered.
  const tHero = await getTranslations({ locale: resolveLocale(locale), namespace: 'hero' });
  const pageUrl = absoluteUrl(localizedPath(resolveLocale(locale), '/'));
  const structuredData = graph([
    businessNode(tHero('lead')),
    websiteNode(),
    ...serviceNodes(services, pageUrl),
  ]);

  return (
    <div className="page">
      <JsonLd data={structuredData} />
      <Hero locale={locale} />
      <Services locale={locale} services={services as any} />
      <ValueStack locale={locale} />
      <TrustIndicators locale={locale} testimonials={testimonials as any} />
    </div>
  );
}
