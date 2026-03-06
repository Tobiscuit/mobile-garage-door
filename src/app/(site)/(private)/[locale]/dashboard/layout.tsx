import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionSafe } from '@/lib/get-session-safe';
import NativeSignInPrompt from '@/features/auth/NativeSignInPrompt';
import Sidebar from '@/features/admin/Sidebar';
import React from 'react';
import { getDB } from "@/db";
import { settings as settingsTable } from "@/db/schema";
import { getCloudflareContext } from "@/lib/cloudflare";
import NextIntlProvider from '@/components/NextIntlProvider';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = (await params) || {};
  const locale = resolvedParams.locale || 'en';
  let headersList = new Headers();
  let isStaticPass = false;
  try {
    headersList = await headers();
  } catch (err) {
    console.warn("Vinext headers context missing during dashboard layout render");
    isStaticPass = true;
  }
  const session = await getSessionSafe(headersList);

  if (!session && !isStaticPass) {
    redirect('/login');
  }

  let themePreference = 'candlelight';
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const settingsData = await db.query.settings.findFirst();
    if (settingsData?.themePreference) {
      themePreference = settingsData.themePreference;
    }
  } catch (error) {
    console.error("LAYOUT SETTINGS FETCH CRASH:", error);
  }

  // Load locale for hydration
  let messages: any = {};
  try {
    if (locale === 'es') {
      messages = (await import('../../../../../../messages/es.json')).default;
    } else if (locale === 'vi') {
      messages = (await import('../../../../../../messages/vi.json')).default;
    } else {
      messages = (await import('../../../../../../messages/en.json')).default;
    }
  } catch (err) {
    console.warn("Could not load messages for locale:", locale, err);
  }

  return (
    <NextIntlProvider
      messages={messages}
      locale={locale}
      timeZone="America/Chicago"
    >
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
    </NextIntlProvider>
  );
}
