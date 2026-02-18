import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { getSessionSafe } from '@/lib/get-session-safe';
import NativeSignInPrompt from '@/features/auth/NativeSignInPrompt';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const session = await getSessionSafe(headersList);
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans flex flex-col">
      <NativeSignInPrompt />
      <main className="flex-grow pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
           {children}
        </div>
      </main>
    </div>
  );
}
