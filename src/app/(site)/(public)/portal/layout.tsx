import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });

  // UPDATED: Check for 'users' collection instead of 'customers'
  // Also allow admins/techs to view portal for testing if needed, or strictly enforce customer role
  if (!user || user.collection !== 'users') {
    redirect('/login');
  }

  // Optional: Redirect non-customers back to dashboard if they try to access portal?
  // For now, let's allow it so admins can see what customers see.

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <main className="flex-grow pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
           {children}
        </div>
      </main>
    </div>
  );
}
