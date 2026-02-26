'use client';

import React, { useState } from 'react';
import { Sheet } from '@/shared/ui/Sheet';
import { PaymentHistory } from './PaymentHistory';
import { ActiveJobsList, TechnicianList } from './QuickLists';

interface KPIGridProps {
  stats: {
    revenue: {
      lifetime: number;
      monthly: number;
      weekly: number;
      today: number;
    };
    jobs: {
      active: number;
      pending: number;
      total: number;
    };
    technicians: {
      total: number;
      online: number;
    };
  };
}

export function KPIGrid({ stats }: KPIGridProps) {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const kpiData = [
    { 
      id: 'revenue',
      label: 'Revenue (MTD)', 
      value: formatCurrency(stats.revenue.monthly), 
      change: '+12%', 
      color: '#2ecc71',
      subtext: `Lifetime: ${formatCurrency(stats.revenue.lifetime)}`,
      action: () => setActiveSheet('revenue'),
    },
    { 
      id: 'jobs',
      label: 'Active Requests', 
      value: stats.jobs.active.toString(), 
      change: '+5%', 
      color: '#f1c40f',
      subtext: `${stats.jobs.pending} Pending Quotes`,
      action: () => setActiveSheet('jobs'),
    },
    { 
      id: 'techs',
      label: 'Technicians', 
      value: stats.technicians.total.toString(), 
      change: 'Online', 
      color: '#3498db',
      subtext: `${stats.technicians.online} Available`,
      action: () => setActiveSheet('techs'),
    },
    { 
      id: 'today',
      label: 'Today\'s Revenue', 
      value: formatCurrency(stats.revenue.today), 
      change: 'Live', 
      color: '#9b59b6',
      subtext: `Weekly: ${formatCurrency(stats.revenue.weekly)}`,
      action: () => setActiveSheet('revenue'), // Reuse revenue sheet for now
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-12">
        {kpiData.map((kpi, i) => (
          <div 
            key={i} 
            onClick={kpi.action}
            className="
              backdrop-blur-md 
              p-4 md:p-6 rounded-3xl 
              hover:border-[var(--staff-accent)]
              transition-all duration-300 ease-out
              group 
              shadow-lg hover:shadow-[0_0_30px_-10px_rgba(241,196,15,0.1)]
              relative overflow-hidden cursor-pointer
              active:scale-[0.98]
            "
            style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}
          >
             {/* Background Glow Effect */}
             <div 
               className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500"
               style={{ backgroundColor: kpi.color }}
             />
             
             <div className="flex flex-col md:flex-row justify-between items-start mb-2 md:mb-4 relative z-10 gap-2">
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--staff-muted)' }}>{kpi.label}</div>
                <span className="text-[10px] md:text-xs font-bold px-2 py-1 rounded-full hidden md:inline-block backdrop-blur-sm transition-colors" style={{ color: 'var(--staff-text)', backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)' }}>
                  {kpi.change}
                </span>
             </div>
             
             <div className="text-2xl md:text-4xl font-black group-hover:scale-105 transition-transform origin-left mb-1 relative z-10 truncate tracking-tight" style={{ color: 'var(--staff-text)' }}>
                {kpi.value}
             </div>
             
             {kpi.subtext && (
               <div className="text-[10px] md:text-xs font-medium relative z-10 truncate opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--staff-muted)' }}>
                 {kpi.subtext}
               </div>
             )}
             
             {/* Interactive Chevron Hint */}
             <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300 text-white/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </div>
          </div>
        ))}
      </div>

      {/* Sheets */}
      <Sheet 
        isOpen={activeSheet === 'revenue'} 
        onClose={() => setActiveSheet(null)}
        title="Revenue & Payments"
      >
        <PaymentHistory />
      </Sheet>

      <Sheet 
        isOpen={activeSheet === 'jobs'} 
        onClose={() => setActiveSheet(null)}
        title="Active Jobs"
      >
        <ActiveJobsList />
      </Sheet>

      <Sheet 
        isOpen={activeSheet === 'techs'} 
        onClose={() => setActiveSheet(null)}
        title="Technician Status"
      >
        <TechnicianList />
      </Sheet>
    </>
  );
}
