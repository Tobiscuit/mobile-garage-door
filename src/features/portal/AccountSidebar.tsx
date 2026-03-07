'use client';
import React from 'react';
import { PasskeyManager } from './PasskeyManager';
import { useTranslations } from '@/hooks/useTranslations';

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface AccountSidebarProps {
  customer: Customer;
}

export function AccountSidebar({ customer }: AccountSidebarProps) {
  const t = useTranslations('portal_page');
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">{t('account_details')}</h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400">{t('name_label')}</div>
            <div className="font-medium text-charcoal-blue">{customer.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{t('email_label')}</div>
            <div className="font-medium text-charcoal-blue">{customer.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">{t('phone_label')}</div>
            <div className="font-medium text-charcoal-blue">{customer.phone}</div>
          </div>
        </div>
      </div>

      <div className="bg-charcoal-blue/5 rounded-xl p-6 border border-charcoal-blue/10">
        <h3 className="font-bold text-charcoal-blue text-sm mb-2">{t('need_assistance')}</h3>
        <p className="text-sm text-gray-600 mb-4">{t('support_desc')}</p>
        <a href="tel:8324191293" className="text-charcoal-blue font-bold text-lg hover:text-golden-yellow transition-colors block">
          (832) 419-1293
        </a>
      </div>

      <PasskeyManager />

      <button 
        onClick={async () => {
          const { authClient } = await import('@/lib/auth-client');
          await authClient.signOut();
          window.location.href = '/';
        }}
        className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 hover:text-red-700 transition-colors bg-white shadow-sm"
      >
        {t('sign_out')}
      </button>
    </div>
  );
}
