'use client';

import React from 'react';
import Link from 'next/link';

const CustomDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#2c3e50] text-[#f7f9fb] font-sans p-8">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12 border-b border-[#ffffff10] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#f1c40f] text-[#2c3e50] font-black rounded px-2 py-0.5 text-xs uppercase tracking-widest">
              Admin Terminal
            </div>
            <div className="text-[#7f8c8d] text-sm font-mono">v3.76.0</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Mobil Garage <span className="text-[#f1c40f]">Command</span>
          </h1>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-[#f1c40f] font-bold text-xl">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
          <div className="text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* KPI 1 */}
        <div className="bg-[#34495e] p-6 rounded-xl border border-[#ffffff10] shadow-xl hover:border-[#f1c40f40] transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#ffffff05] rounded-lg group-hover:bg-[#f1c40f20] transition-colors">
              <svg className="w-6 h-6 text-[#bdc3c7] group-hover:text-[#f1c40f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span className="text-xs font-bold text-[#2ecc71] bg-[#2ecc7120] px-2 py-1 rounded">+12%</span>
          </div>
          <div className="text-4xl font-black text-white mb-1">24</div>
          <div className="text-xs font-bold text-[#7f8c8d] uppercase tracking-wider">Active Service Requests</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#34495e] p-6 rounded-xl border border-[#ffffff10] shadow-xl hover:border-[#f1c40f40] transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#ffffff05] rounded-lg group-hover:bg-[#f1c40f20] transition-colors">
              <svg className="w-6 h-6 text-[#bdc3c7] group-hover:text-[#f1c40f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="text-xs font-bold text-[#2ecc71] bg-[#2ecc7120] px-2 py-1 rounded">+5%</span>
          </div>
          <div className="text-4xl font-black text-white mb-1">$42.5k</div>
          <div className="text-xs font-bold text-[#7f8c8d] uppercase tracking-wider">Monthly Revenue</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#34495e] p-6 rounded-xl border border-[#ffffff10] shadow-xl hover:border-[#f1c40f40] transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#ffffff05] rounded-lg group-hover:bg-[#f1c40f20] transition-colors">
              <svg className="w-6 h-6 text-[#bdc3c7] group-hover:text-[#f1c40f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
             <span className="text-xs font-bold text-white bg-[#ffffff20] px-2 py-1 rounded">8 Online</span>
          </div>
          <div className="text-4xl font-black text-white mb-1">12</div>
          <div className="text-xs font-bold text-[#7f8c8d] uppercase tracking-wider">Active Technicians</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#34495e] p-6 rounded-xl border border-[#ffffff10] shadow-xl hover:border-[#f1c40f40] transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#ffffff05] rounded-lg group-hover:bg-[#f1c40f20] transition-colors">
              <svg className="w-6 h-6 text-[#bdc3c7] group-hover:text-[#f1c40f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <span className="text-xs font-bold text-[#f1c40f] bg-[#f1c40f20] px-2 py-1 rounded">Action Needed</span>
          </div>
          <div className="text-4xl font-black text-white mb-1">3</div>
          <div className="text-xs font-bold text-[#7f8c8d] uppercase tracking-wider">Pending Quotes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* QUICK ACTIONS */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-[#f1c40f] rounded-full"></span>
                Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/collections/service-requests/create" className="group p-4 bg-[#34495e] border border-[#ffffff10] rounded-xl hover:bg-[#3e5669] transition-all flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f1c40f] flex items-center justify-center text-[#2c3e50] font-bold group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm">New Dispatch</div>
                        <div className="text-[#7f8c8d] text-xs">Create request</div>
                    </div>
                </Link>

                <Link href="/admin/collections/customers/create" className="group p-4 bg-[#34495e] border border-[#ffffff10] rounded-xl hover:bg-[#3e5669] transition-all flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffffff10] flex items-center justify-center text-white font-bold group-hover:bg-[#ffffff20] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm">Add Customer</div>
                        <div className="text-[#7f8c8d] text-xs">New client</div>
                    </div>
                </Link>

                 <Link href="/admin/collections/invoices/create" className="group p-4 bg-[#34495e] border border-[#ffffff10] rounded-xl hover:bg-[#3e5669] transition-all flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffffff10] flex items-center justify-center text-white font-bold group-hover:bg-[#ffffff20] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm">Draft Invoice</div>
                        <div className="text-[#7f8c8d] text-xs">Create bill</div>
                    </div>
                </Link>

                 <Link href="/admin/collections/posts/create" className="group p-4 bg-[#34495e] border border-[#ffffff10] rounded-xl hover:bg-[#3e5669] transition-all flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffffff10] flex items-center justify-center text-white font-bold group-hover:bg-[#ffffff20] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm">Write Post</div>
                        <div className="text-[#7f8c8d] text-xs">Publish update</div>
                    </div>
                </Link>
            </div>
        </div>

        {/* RECENT ACTIVITY MOCK */}
        <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-[#bdc3c7] rounded-full"></span>
                System Status
            </h2>
            <div className="bg-[#34495e] border border-[#ffffff10] rounded-xl p-6">
                <ul className="space-y-6">
                    <li className="flex gap-4 items-start">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[#2ecc71]"></div>
                        <div>
                            <div className="text-white font-bold">System Online</div>
                            <div className="text-[#7f8c8d] text-xs">All services operational</div>
                        </div>
                    </li>
                     <li className="flex gap-4 items-start">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[#f1c40f]"></div>
                        <div>
                            <div className="text-white font-bold">Database Backup</div>
                            <div className="text-[#7f8c8d] text-xs">Scheduled for 02:00 AM</div>
                        </div>
                    </li>
                     <li className="flex gap-4 items-start">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[#3498db]"></div>
                        <div>
                            <div className="text-white font-bold">Sync Active</div>
                            <div className="text-[#7f8c8d] text-xs">Square Payments connected</div>
                        </div>
                    </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-[#ffffff10]">
                    <div className="text-[#7f8c8d] text-xs uppercase font-bold tracking-widest mb-2">Storage Usage</div>
                    <div className="w-full bg-[#2c3e50] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#f1c40f] h-full w-[35%]"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-[#bdc3c7]">
                        <span>35% Used</span>
                        <span>15GB Available</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CustomDashboard;
