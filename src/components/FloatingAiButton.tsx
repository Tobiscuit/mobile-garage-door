'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const FloatingAiButton = () => {
    const pathname = usePathname();
    
    // Don't show on the diagnostic page itself or dashboard
    if (pathname === '/diagnose' || pathname?.startsWith('/dashboard')) return null;

    return (
        <Link 
            href="/diagnose"
            className="fixed bottom-6 right-6 z-50 group"
        >
            <div className="absolute inset-0 bg-[#f1c40f] rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity"></div>
            <div className="relative flex items-center justify-center w-14 h-14 bg-charcoal-blue border-2 border-[#f1c40f] rounded-full shadow-2xl transition-transform group-hover:scale-110">
                 <svg className="w-7 h-7 text-[#f1c40f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                 
                 <div className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-charcoal-blue"></span>
                 </div>
            </div>
            <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 bg-charcoal-blue text-[#f1c40f] text-xs font-bold uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 shadow-xl border border-white/10">
                Service Hero
            </div>
        </Link>
    );
};
