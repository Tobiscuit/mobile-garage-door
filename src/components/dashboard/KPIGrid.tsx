import React from 'react';

const KPI_DATA = [
  { label: 'Revenue (MTD)', value: '2,500', change: '+12%', color: '#2ecc71' },
  { label: 'Active Requests', value: '24', change: '+5%', color: '#f1c40f' },
  { label: 'Pending Quotes', value: '8', change: '-2%', color: '#e74c3c' },
  { label: 'Technicians', value: '12', change: 'Online', color: '#3498db' },
];

export function KPIGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {KPI_DATA.map((kpi, i) => (
        <div key={i} className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] p-6 rounded-2xl hover:border-[#f1c40f]/30 transition-all group hover:bg-[#34495e]/80 shadow-lg">
           <div className="flex justify-between items-start mb-4">
              <div className="text-[#7f8c8d] text-xs font-bold uppercase tracking-wider">{kpi.label}</div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-[#ffffff05] text-white">{kpi.change}</span>
           </div>
           <div className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">
              {kpi.value}
           </div>
        </div>
      ))}
    </div>
  );
}
