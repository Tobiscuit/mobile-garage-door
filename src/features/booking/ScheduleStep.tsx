'use client';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BookingFormData } from '@/hooks/useBookingForm';
import { useTranslations } from '@/hooks/useTranslations';

interface ScheduleStepProps {
  formData: BookingFormData;
  updateField: (key: keyof BookingFormData, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function ScheduleStep({ formData, updateField, nextStep, prevStep }: ScheduleStepProps) {
  const t = useTranslations('booking');
  const isEmergency = formData.urgency === 'emergency';

  return (
    <div className="space-y-6 animate-fadeIn relative z-10">
      <h1 className="text-3xl font-black text-charcoal-blue">{t('schedule_heading')}</h1>

      {isEmergency ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3"><AlertTriangle className="w-10 h-10 mx-auto text-red-500" /></div>
          <div className="text-xl font-black text-red-600 mb-1">ASAP</div>
          <p className="text-sm text-red-500/70">
            {t('emergency_asap_desc') || 'Your emergency request will be dispatched immediately. Our team will contact you shortly.'}
          </p>
        </div>
      ) : (
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
      )}

      <div className="flex gap-4">
        <button onClick={prevStep} className="w-1/3 text-gray-500 font-bold hover:text-charcoal-blue">{t('back')}</button>
        <button
          onClick={nextStep}
          disabled={!isEmergency && !formData.scheduledTime}
          className="w-2/3 bg-charcoal-blue text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-dark-charcoal transition-all"
        >
          {t('continue')}
        </button>
      </div>
    </div>
  );
}
