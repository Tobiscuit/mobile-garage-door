import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.AUTH_BYPASS === 'true') {
    return (
      <div className="min-h-screen font-sans selection:bg-[#f1c40f] selection:text-[#2c3e50]" style={{ backgroundColor: 'var(--staff-bg)', color: 'var(--staff-text)' }}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('app-theme')||'light';document.documentElement.setAttribute('data-app-theme',t);}catch(e){}",
          }}
        />
        <Sidebar />
        <main className="md:ml-[280px] min-h-screen relative z-0 pb-20 md:pb-0">
          <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(circle_at_top_right,rgba(241,196,15,0.08),transparent_40%)]" />
          <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    );
  }

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen font-sans selection:bg-[#f1c40f] selection:text-[#2c3e50]" style={{ backgroundColor: 'var(--staff-bg)', color: 'var(--staff-text)' }}>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('app-theme')||'light';document.documentElement.setAttribute('data-app-theme',t);}catch(e){}",
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
