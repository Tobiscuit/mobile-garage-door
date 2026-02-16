import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    redirect('/login');
  }

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
