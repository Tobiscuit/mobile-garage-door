import React from 'react';
import Link from 'next/link';
import ActiveUsers from '@/components/admin/ActiveUsers';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { getDashboardStats } from './actions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12 border-b border-[#ffffff10] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#f1c40f] text-[#2c3e50] font-black rounded px-2 py-0.5 text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(241,196,15,0.4)]">
              System Online
            </div>
            <div className="text-[#7f8c8d] text-sm font-mono">v2.1.0 (Live Data)</div>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            Command <span className="text-[#f1c40f]">Center</span>
          </h1>
        </div>
        <div className="text-right">
            <div className="text-2xl font-bold text-[#f1c40f]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div className="text-[#bdc3c7]">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
        </div>
      </div>

      <KPIGrid stats={stats} />

      {/* MAIN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <QuickActions />

        {/* RIGHT: Active Users Widget */}
        <div className="lg:col-span-1">
             <ActiveUsers />
        </div>
      </div>
    </div>
  );
}
