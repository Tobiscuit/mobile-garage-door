import { useState } from 'react';

export interface BookingFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  guestPassword?: string;
  issueDescription: string;
  urgency: 'standard' | 'emergency';
  scheduledTime: string;
}

export type BookingStep = 0 | 1 | 2 | 3;

const INITIAL_DATA: BookingFormData = {
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  guestAddress: '',
  guestPassword: '',
  issueDescription: '',
  urgency: 'standard',
  scheduledTime: '',
};

export function useBookingForm() {
  const [step, setStep] = useState<BookingStep>(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('aiDiagnosis');
      if (raw) {
        try {
          const diagnosis = JSON.parse(raw);
          if (diagnosis.fromDiagnosis) return 1; // Skip to Issue step
        } catch {}
      }
    }
    return 0;
  });
  
  const [formData, setFormData] = useState<BookingFormData>(() => {
    const data = { ...INITIAL_DATA };
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('aiDiagnosis');
      if (raw) {
        try {
          const diagnosis = JSON.parse(raw);
          if (diagnosis.fromDiagnosis) {
            data.issueDescription = diagnosis.issueDescription || '';
            data.urgency = diagnosis.urgency || 'standard';
            sessionStorage.removeItem('aiDiagnosis'); // Clean up
          }
        } catch {}
      }
    }
    return data;
  });

  const updateField = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3) as BookingStep);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0) as BookingStep);

  return {
    step,
    formData,
    updateField,
    nextStep,
    prevStep,
    setStep,
  };
}
