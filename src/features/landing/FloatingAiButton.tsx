'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const tooltipText: Record<string, string> = {
    en: 'Service Hero',
    es: 'Asistente de Servicio',
    vi: 'Trợ lý Dịch vụ',
};

export const FloatingAiButton = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    
    // Don't show on the diagnostic page itself or dashboard
    if (pathname === '/diagnose' || pathname?.startsWith('/dashboard')) return null;

    // Detect locale from pathname (e.g. /es/portfolio → 'es')
    const locale = pathname?.startsWith('/es') ? 'es' : pathname?.startsWith('/vi') ? 'vi' : 'en';

    const diagnoseUrl = `/diagnose?lang=${locale}`;

    const handleNavigation = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsNavigating(true);
        // Slight delay to allow animation to play before actual route change
        setTimeout(() => {
            router.push(diagnoseUrl);
        }, 300);
    };

    return (
        <a 
            href={diagnoseUrl}
            onClick={handleNavigation}
            className={`fixed bottom-6 right-6 z-50 group transition-all duration-500 ease-in-out ${isNavigating ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
        >
            <div className="absolute inset-0 bg-[#f1c40f] rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity"></div>
            <div className="relative flex items-center justify-center w-14 h-14 bg-charcoal-blue text-golden-yellow border-2 border-golden-yellow/50 rounded-full shadow-[0_0_20px_rgba(241,196,15,0.2)] transition-all duration-300 group-hover:scale-110 group-hover:border-golden-yellow group-hover:shadow-[0_0_30px_rgba(241,196,15,0.4)]">
                 <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
            </div>
            <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 bg-charcoal-blue text-[#f1c40f] text-xs font-bold uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 shadow-xl border border-white/10">
                {tooltipText[locale] || tooltipText.en}
            </div>
        </a>
    );
};
