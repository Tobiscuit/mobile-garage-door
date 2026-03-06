import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { getSessionSafe } from '@/lib/get-session-safe';
import NativeSignInPrompt from '@/features/auth/NativeSignInPrompt';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = (await params) || { locale: 'en' } as any;
  const locale = resolvedParams.locale || 'en';
  let headersList = new Headers();
  let isStaticPass = false;
  try {
    headersList = await headers();
  } catch (err) {
    console.warn("Vinext headers context missing during portal layout render");
    isStaticPass = true;
  }
  const session = await getSessionSafe(headersList);
  if (!session && !isStaticPass) {
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
