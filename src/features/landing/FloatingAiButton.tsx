'use client';

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

    const handleNavigation = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsNavigating(true);
        // Slight delay to allow animation to play before actual route change
        setTimeout(() => {
            router.push('/diagnose');
        }, 300);
    };

    // Restyled in the brand's red and white. Tailwind utilities (not site.css)
    // because the root layout also renders this button on private routes,
    // which don't load the public stylesheet. Destination, delayed navigation
    // and labels are unchanged. `floating-ai` lets site.css lift the button
    // above the mobile action bar.
    return (
        <a
            href="/diagnose"
            onClick={handleNavigation}
            className={`floating-ai group fixed bottom-6 right-6 z-50 motion-safe:transition-all motion-safe:duration-500 ${isNavigating ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'} rounded-full focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-red`}
        >
            <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-brand-white bg-brand-red text-brand-white shadow-lg motion-safe:transition-transform group-hover:scale-105">
                <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </span>
            <span className="absolute bottom-full right-0 mb-2 w-max rounded-lg bg-brand-ink px-3 py-1 text-xs font-bold text-brand-white opacity-0 motion-safe:transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {tooltipText[locale] || tooltipText.en}
            </span>
        </a>
    );
};
