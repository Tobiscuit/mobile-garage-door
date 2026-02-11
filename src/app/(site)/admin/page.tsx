import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12 border-b border-[#ffffff10] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#f1c40f] text-[#2c3e50] font-black rounded px-2 py-0.5 text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(241,196,15,0.4)]">
              System Online
            </div>
            <div className="text-[#7f8c8d] text-sm font-mono">v2.0.0 (Bespoke)</div>
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

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Revenue (MTD)', value: '$42,500', change: '+12%', color: '#2ecc71' },
          { label: 'Active Requests', value: '24', change: '+5%', color: '#f1c40f' },
          { label: 'Pending Quotes', value: '8', change: '-2%', color: '#e74c3c' },
          { label: 'Technicians', value: '12', change: 'Online', color: '#3498db' },
        ].map((kpi, i) => (
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

        {/* QUICK ACTIONS */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#f1c40f] rounded-full shadow-[0_0_10px_#f1c40f]"></span>
            Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/services/create" className="group p-6 bg-[#34495e]/30 border border-[#ffffff08] rounded-2xl hover:bg-[#f1c40f] transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffffff10] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                     <svg className="w-6 h-6 text-[#f1c40f] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div>
                    <div className="font-bold text-lg text-white group-hover:text-[#2c3e50]">New Service</div>
                    <div className="text-sm text-[#7f8c8d] group-hover:text-[#2c3e50]/70">Add a service offering</div>
                </div>
            </Link>

            <Link href="/admin/projects/create" className="group p-6 bg-[#34495e]/30 border border-[#ffffff08] rounded-2xl hover:bg-[#f1c40f] transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffffff10] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                     <svg className="w-6 h-6 text-[#f1c40f] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                    <div className="font-bold text-lg text-white group-hover:text-[#2c3e50]">New Project</div>
                    <div className="text-sm text-[#7f8c8d] group-hover:text-[#2c3e50]/70">Showcase recent work</div>
                </div>
            </Link>

             <Link href="/admin/posts/create" className="group p-6 bg-[#34495e]/30 border border-[#ffffff08] rounded-2xl hover:bg-[#f1c40f] transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffffff10] flex items-center justify-center group-hover:bg-white/20 transition-colors">
                     <svg className="w-6 h-6 text-[#f1c40f] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div>
                    <div className="font-bold text-lg text-white group-hover:text-[#2c3e50]">Write Post</div>
                    <div className="text-sm text-[#7f8c8d] group-hover:text-[#2c3e50]/70">Publish blog content</div>
                </div>
            </Link>
        </div>
    </div>
  );
}
