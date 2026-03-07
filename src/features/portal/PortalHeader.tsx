'use client';

import React from 'react';
import Link from '@/shared/ui/Link';
import { useTranslations } from '@/hooks/useTranslations';

interface PortalHeaderProps {
  customerName: string;
  isBuilder?: boolean;
  isAdmin?: boolean;
}

export function PortalHeader({ customerName, isBuilder, isAdmin }: PortalHeaderProps) {
  const t = useTranslations('portal_page');
  return (
    <div className="bg-charcoal-blue text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2 flex-wrap">
            {isBuilder && (
                 <span className="bg-golden-yellow text-charcoal-blue text-xs px-2 py-1 rounded font-bold uppercase tracking-wider self-start mt-1.5">{t('builder_label')}</span>
            )}
            <span>{isBuilder ? t('command_center') : t('welcome_back')}, <span className="text-golden-yellow">{customerName}</span></span>
          </h1>
          <p className="text-gray-400 font-medium">
            {isBuilder ? t('manage_builder') : t('manage_customer')}
          </p>
        </div>
        <div className="flex gap-4">
            {isAdmin && (
                <Link
                href="/dashboard"
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                >
                {t('admin_view')}
                </Link>
            )}
            <Link
            href={isBuilder ? "/contact?source=portal&type=contractor" : "/contact?source=portal"}
            className="bg-golden-yellow text-charcoal-blue font-black py-4 px-8 rounded-xl uppercase tracking-wider shadow-lg hover:bg-yellow-400 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            {isBuilder ? t('new_job_order') : t('book_service')}
            </Link>
        </div>
      </div>
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 p-32 bg-white rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
    </div>
  );
}
