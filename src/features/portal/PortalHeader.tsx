import React from 'react';
import Link from 'next/link';

interface PortalHeaderProps {
  customerName: string;
  isBuilder?: boolean;
  isAdmin?: boolean;
}

export function PortalHeader({ customerName, isBuilder, isAdmin }: PortalHeaderProps) {
  return (
    <div className="bg-charcoal-blue text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2 flex-wrap">
            {isAdmin && (
                 <Link href="/dashboard" className="bg-[#f1c40f]/20 hover:bg-[#f1c40f]/30 text-[#f1c40f] border border-[#f1c40f]/50 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1 transition-colors">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                     Admin View
                 </Link>
            )}
            {isBuilder && (
                 <span className="bg-golden-yellow text-charcoal-blue text-xs px-2 py-1 rounded font-bold uppercase tracking-wider self-start mt-1.5">Builder</span>
            )}
            <span>{isBuilder ? 'Command Center' : 'Welcome back'}, <span className="text-golden-yellow">{customerName}</span></span>
          </h1>
          <p className="text-gray-400 font-medium">
            {isBuilder 
                ? 'Manage active job sites, schedules, and billing.'
                : 'Manage your garage service requests and view history.'}
          </p>
        </div>
        <Link
          href="/portal/book"
          className="bg-golden-yellow text-charcoal-blue font-black py-4 px-8 rounded-xl uppercase tracking-wider shadow-lg hover:bg-yellow-400 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          {isBuilder ? 'New Job Order' : 'Book Service'}
        </Link>
      </div>
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 p-32 bg-white rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
    </div>
  );
}
