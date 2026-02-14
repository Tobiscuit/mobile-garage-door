'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/app/actions/booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import { useSquarePayment } from '@/hooks/useSquarePayment';
import { ContactStep } from '@/components/booking/ContactStep';
import { IssueStep } from '@/components/booking/IssueStep';
import { ScheduleStep } from '@/components/booking/ScheduleStep';
import { PaymentStep } from '@/components/booking/PaymentStep';

export default function BookingPage() {
  const router = useRouter();
  const { step, formData, updateField, nextStep, prevStep } = useBookingForm();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID || 'sandbox-sq0idb-YOUR_APP_ID_HERE'; 
  const LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || 'YOUR_LOCATION_ID_HERE';
  const SQUARE_SCRIPT_SRC = APP_ID.startsWith('sandbox')
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js';

  // Initialize Square Hook
  const { card, setSdkLoaded, error: squareError, tokenizeCard } = useSquarePayment(
    step === 3,
    APP_ID,
    LOCATION_ID
  );

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');

    try {
      // 1. Tokenize Card
      const token = await tokenizeCard();

      // 2. Create FormData for Server Action
      const submissionData = new FormData();
      submissionData.append('guestName', formData.guestName);
      submissionData.append('guestEmail', formData.guestEmail);
      submissionData.append('guestPhone', formData.guestPhone);
      submissionData.append('guestAddress', formData.guestAddress);
      if (formData.guestPassword) {
        submissionData.append('guestPassword', formData.guestPassword);
      }
      submissionData.append('issueDescription', formData.issueDescription);
      submissionData.append('urgency', formData.urgency);
      submissionData.append('scheduledTime', formData.scheduledTime);
      submissionData.append('sourceId', token);

      // 3. Call Server Action
      const response = await createBooking(null, submissionData);

      if (response?.error) {
        throw new Error(response.error);
      }

      // Redirect is handled by the server action on success

    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Booking failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloudy-white py-12 px-4 font-work-sans">
      <Script 
        src={SQUARE_SCRIPT_SRC}
        onLoad={() => setSdkLoaded(true)} 
      />

      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            <span className={step >= 0 ? 'text-charcoal-blue' : ''}>Contact</span>
            <span className={step >= 1 ? 'text-charcoal-blue' : ''}>Issue</span>
            <span className={step >= 2 ? 'text-charcoal-blue' : ''}>Time</span>
            <span className={step >= 3 ? 'text-charcoal-blue' : ''}>Secure</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full bg-golden-yellow transition-all duration-500 ease-in-out`} style={{ width: `${(step + 1) * 25}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 relative overflow-hidden">

          {/* Background Pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          </div>

          {step === 0 && (
            <ContactStep
              formData={formData}
              updateField={updateField}
              nextStep={nextStep}
            />
          )}

          {step === 1 && (
            <IssueStep
              formData={formData}
              updateField={updateField}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {step === 2 && (
            <ScheduleStep
              formData={formData}
              updateField={updateField}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {step === 3 && (
            <PaymentStep
              prevStep={prevStep}
              handleSubmit={handleSubmit}
              loading={loading}
              error={submitError || squareError}
              isCardReady={!!card}
            />
          )}

        </div>
      </div>
    </div>
  );
}
