import React from 'react';
import Link from 'next/link';

interface PortalHeaderProps {
  customerName: string;
}

export function PortalHeader({ customerName }: PortalHeaderProps) {
  return (
    <div className="bg-charcoal-blue text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2">Welcome back, {customerName}</h1>
          <p className="text-gray-400">Manage your garage service requests and view history.</p>
        </div>
        <Link
          href="/portal/book"
          className="bg-golden-yellow text-charcoal-blue font-black py-4 px-8 rounded-xl uppercase tracking-wider shadow-lg hover:bg-yellow-400 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Book Service
        </Link>
      </div>
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 p-32 bg-white rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
    </div>
  );
}
