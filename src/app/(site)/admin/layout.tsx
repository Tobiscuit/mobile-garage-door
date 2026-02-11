import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getPayload({ config: configPromise });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });

  if (!user) {
    redirect('/db/login?redirect=' + encodeURIComponent('/admin'));
  }

  return (
    <div className="min-h-screen bg-[#2c3e50] text-white font-sans selection:bg-[#f1c40f] selection:text-[#2c3e50]">
      <Sidebar />
      
      {/* MAIN CONTENT AREA - Matches sidebar width 280px */}
      <main className="ml-[280px] min-h-screen relative z-0">
         {/* Glassmorphic Background Effect */}
         <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(circle_at_top_right,rgba(241,196,15,0.05),transparent_40%)]" />
         
         <div className="p-8 max-w-7xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  );
}
