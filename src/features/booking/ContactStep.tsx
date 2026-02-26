'use client';
import React from 'react';
import { BookingFormData } from '@/hooks/useBookingForm';
import { useTranslations } from 'next-intl';

interface ContactStepProps {
  formData: BookingFormData;
  updateField: (key: keyof BookingFormData, value: any) => void;
  nextStep: () => void;
}

export function ContactStep({ formData, updateField, nextStep }: ContactStepProps) {
  const t = useTranslations('booking');
  const isValid = formData.guestName && formData.guestPhone && formData.guestEmail && formData.guestAddress;

  return (
    <div className="space-y-6 animate-fadeIn relative z-10">
      <h1 className="text-4xl font-black text-charcoal-blue tracking-tight">{t('contact_heading')}</h1>
      <p className="text-gray-500">{t('contact_desc')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('full_name')}</label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
            placeholder="John Doe"
            value={formData.guestName}
            onChange={(e) => updateField('guestName', e.target.value)}
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('phone_number')}</label>
          <input
            type="tel"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
            placeholder="(555) 123-4567"
            value={formData.guestPhone}
            onChange={(e) => updateField('guestPhone', e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('email_address')}</label>
          <input
            type="email"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
            placeholder="john@example.com"
            value={formData.guestEmail}
            onChange={(e) => updateField('guestEmail', e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('service_address')}</label>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none h-24 resize-none"
            placeholder={t('address_placeholder')}
            value={formData.guestAddress}
            onChange={(e) => updateField('guestAddress', e.target.value)}
          />
        </div>

        <div className="col-span-2 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="createAccount"
              className="w-5 h-5 text-golden-yellow rounded focus:ring-golden-yellow border-gray-300"
              checked={!!formData.guestPassword}
              onChange={(e) => updateField('guestPassword', e.target.checked ? 'temp123' : '')}
            />
            <label htmlFor="createAccount" className="font-bold text-charcoal-blue cursor-pointer select-none">
              {t('create_account')}
            </label>
          </div>

          {formData.guestPassword && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('create_password')}</label>
              <input
                type="password"
                className="w-full bg-white border border-gray-300 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
                placeholder={t('password_placeholder')}
                value={formData.guestPassword === 'temp123' ? '' : formData.guestPassword}
                onChange={(e) => updateField('guestPassword', e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-2">{t('username_note')}</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={nextStep}
        disabled={!isValid}
        className="w-full bg-charcoal-blue text-white font-black py-5 rounded-xl text-lg disabled:opacity-50 hover:bg-dark-charcoal transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        {t('locate_tech')}
      </button>
    </div>
  );
}
