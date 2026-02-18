import React from 'react';
import Link from 'next/link';
import ActiveUsers from '@/features/admin/ActiveUsers';
import { KPIGrid } from '@/features/dashboard/KPIGrid';
import { QuickActions } from '@/features/dashboard/QuickActions';
import { getDashboardStats } from './actions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
      {/* HEADER */}
      <div
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-12 pb-4 md:pb-6 gap-4"
        style={{ borderBottom: '1px solid var(--staff-border)' }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#f1c40f] text-[#2c3e50] font-black rounded px-2 py-0.5 text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(241,196,15,0.4)]">
              System Online
            </div>
            <div className="text-xs md:text-sm font-mono" style={{ color: 'var(--staff-muted)' }}>
              v2.1.0 (Live Data)
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--staff-text)' }}>
            Command <span className="text-[#f1c40f]">Center</span>
          </h1>
        </div>
        <div className="text-left md:text-right">
            <div className="text-xl md:text-2xl font-bold text-[#f1c40f]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div className="text-sm md:text-base" style={{ color: 'var(--staff-muted)' }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
        </div>
      </div>

      <KPIGrid stats={stats} />

      {/* MAIN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        <QuickActions />

        {/* RIGHT: Active Users Widget */}
        <div className="lg:col-span-1">
             <ActiveUsers />
        </div>
      </div>
    </div>
  );
}
