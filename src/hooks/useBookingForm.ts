import { useState, useEffect } from 'react';

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
  const [step, setStep] = useState<BookingStep>(0);
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_DATA);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const raw = sessionStorage.getItem('aiDiagnosis');
      if (raw) {
        try {
          const diagnosis = JSON.parse(raw);
          if (diagnosis.fromDiagnosis) {
            setFormData(prev => ({
              ...prev,
              issueDescription: diagnosis.issueDescription || '',
              urgency: diagnosis.urgency || 'standard'
            }));
            setStep(1); // Skip to Issue step
            sessionStorage.removeItem('aiDiagnosis'); // Clean up so it doesn't happen again on refresh
          }
        } catch (e) {
          console.error("Failed to parse aiDiagnosis from sessionStorage", e);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

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
