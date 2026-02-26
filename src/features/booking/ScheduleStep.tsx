'use client';
import React from 'react';
import { BookingFormData } from '@/hooks/useBookingForm';
import { useTranslations } from 'next-intl';

interface ScheduleStepProps {
  formData: BookingFormData;
  updateField: (key: keyof BookingFormData, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function ScheduleStep({ formData, updateField, nextStep, prevStep }: ScheduleStepProps) {
  const t = useTranslations('booking');
  return (
    <div className="space-y-6 animate-fadeIn relative z-10">
      <h1 className="text-3xl font-black text-charcoal-blue">{t('schedule_heading')}</h1>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('datetime_label')}</label>
        <input
          type="datetime-local"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none"
          value={formData.scheduledTime}
          onChange={(e) => updateField('scheduledTime', e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2">{t('sms_note')}</p>
      </div>
      <div className="flex gap-4">
        <button onClick={prevStep} className="w-1/3 text-gray-500 font-bold hover:text-charcoal-blue">{t('back')}</button>
        <button
          onClick={nextStep}
          disabled={!formData.scheduledTime}
          className="w-2/3 bg-charcoal-blue text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-dark-charcoal transition-all"
        >
          {t('continue')}
        </button>
      </div>
    </div>
  );
}
