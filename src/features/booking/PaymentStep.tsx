'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

interface PaymentStepProps {
  prevStep: () => void;
  handleSubmit: () => void;
  loading: boolean;
  error: string;
  isCardReady: boolean;
}

export function PaymentStep({ prevStep, handleSubmit, loading, error, isCardReady }: PaymentStepProps) {
  const t = useTranslations('booking');
  return (
    <div className="space-y-6 animate-fadeIn relative z-10">
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-green-100 text-green-600 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-charcoal-blue mb-2">{t('tech_available')}</h1>
        <p className="text-gray-500">{t('trip_fee')}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">{error}</div>
      )}

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <div id="card-container" className="min-h-[100px]"></div>
      </div>

      <div className="flex gap-4">
        <button onClick={prevStep} disabled={loading} className="w-1/3 text-gray-500 font-bold hover:text-charcoal-blue">{t('back')}</button>
        <button
          onClick={handleSubmit}
          disabled={loading || !isCardReady}
          className="w-2/3 bg-golden-yellow text-charcoal-blue font-black py-4 rounded-xl disabled:opacity-50 hover:bg-yellow-400 shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
        >
          {loading ? (
            <>{t('processing')}</>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              {t('authorize')}
            </>
          )}
        </button>
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-4">
        {t('secure_note')}
      </p>
    </div>
  );
}
