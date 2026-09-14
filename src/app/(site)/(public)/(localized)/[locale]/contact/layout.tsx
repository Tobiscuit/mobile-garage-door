import React from 'react';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/JsonLd';
import { BUSINESS } from '@/lib/seo/site';
import { businessNode, graph } from '@/lib/seo/structured-data';

/**
 * The contact page is a Client Component, and client pages can't export
 * generateMetadata, so its metadata lives in this server layout. The layout
 * renders the page unchanged; the JSON-LD describes the business whose phone
 * number the page shows.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = (await params) || { locale: 'en' };
  return pageMetadata({
    locale,
    path: '/contact',
    title: { key: 'contact_title' },
    description: { key: 'contact_description', values: { phone: BUSINESS.phoneDisplay } },
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={graph([businessNode()])} />
      {children}
    </>
  );
}
