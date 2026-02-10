import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  if (!user || user.collection !== 'customers') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
           {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
