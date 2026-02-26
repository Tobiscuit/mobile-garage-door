import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionSafe } from '@/lib/get-session-safe';
import NativeSignInPrompt from '@/features/auth/NativeSignInPrompt';
import Sidebar from '@/features/admin/Sidebar';
import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = await getSessionSafe(headersList);

  if (!session) {
    redirect('/login');
  }

  const payload = await getPayload({ config: configPromise });
  const settings = await payload.findGlobal({ slug: 'settings' });
  const themePreference = settings.themePreference || 'candlelight';

  return (
    <div 
      className="min-h-screen font-sans selection:bg-[#f1c40f] selection:text-[#2c3e50]" 
      style={{ backgroundColor: 'var(--staff-bg)', color: 'var(--staff-text)' }}

    >
      <NativeSignInPrompt />
      <script
        dangerouslySetInnerHTML={{
          __html:
            `try{var t=localStorage.getItem('app-theme')||'light';document.documentElement.setAttribute('data-app-theme',t);${themePreference === 'original' ? "document.documentElement.setAttribute('data-light-theme','original');" : ''}}catch(e){}`,
        }}
      />
      <Sidebar />
      
      {/* MAIN CONTENT AREA - Matches sidebar width 280px on desktop, full width on mobile */}
      <main className="md:ml-[280px] min-h-screen relative z-0 pb-20 md:pb-0">
         {/* Glassmorphic Background Effect */}
         <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(circle_at_top_right,rgba(241,196,15,0.08),transparent_40%)]" />
         
         <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  );
}
