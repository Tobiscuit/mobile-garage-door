import React from 'react';

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
      label: 'Revenue (MTD)', 
      value: formatCurrency(stats.revenue.monthly), 
      change: '+12%', // Ideally calculate vs last month
      color: '#2ecc71',
      subtext: `Lifetime: ${formatCurrency(stats.revenue.lifetime)}`
    },
    { 
      label: 'Active Requests', 
      value: stats.jobs.active.toString(), 
      change: '+5%', 
      color: '#f1c40f',
      subtext: `${stats.jobs.pending} Pending Quotes`
    },
    { 
      label: 'Technicians', 
      value: stats.technicians.total.toString(), 
      change: 'Online', 
      color: '#3498db',
      subtext: `${stats.technicians.online} Available`
    },
    { 
      label: 'Today\'s Revenue', 
      value: formatCurrency(stats.revenue.today), 
      change: 'Live', 
      color: '#9b59b6',
      subtext: `Weekly: ${formatCurrency(stats.revenue.weekly)}`
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {kpiData.map((kpi, i) => (
        <div key={i} className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] p-6 rounded-2xl hover:border-[#f1c40f]/30 transition-all group hover:bg-[#34495e]/80 shadow-lg relative overflow-hidden">
           {/* Background Glow Effect */}
           <div 
             className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl transition-opacity group-hover:opacity-20"
             style={{ backgroundColor: kpi.color }}
           />
           
           <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="text-[#7f8c8d] text-xs font-bold uppercase tracking-wider">{kpi.label}</div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-[#ffffff05] text-white/80 border border-[#ffffff05] group-hover:border-white/10 transition-colors">
                {kpi.change}
              </span>
           </div>
           
           <div className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left mb-1 relative z-10">
              {kpi.value}
           </div>
           
           {kpi.subtext && (
             <div className="text-xs text-[#bdc3c7] font-medium relative z-10">
               {kpi.subtext}
             </div>
           )}
        </div>
      ))}
    </div>
  );
}
