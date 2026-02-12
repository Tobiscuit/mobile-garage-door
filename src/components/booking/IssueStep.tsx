import React from 'react';
import { BookingFormData } from '@/hooks/useBookingForm';

interface IssueStepProps {
  formData: BookingFormData;
  updateField: (key: keyof BookingFormData, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function IssueStep({ formData, updateField, nextStep, prevStep }: IssueStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn relative z-10">
      <h1 className="text-3xl font-black text-charcoal-blue">What's the status?</h1>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Issue Description</label>
        <textarea
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-medium text-charcoal-blue focus:ring-2 focus:ring-golden-yellow outline-none h-32 resize-none"
          placeholder="e.g. Garage door stuck halfway, making a grinding noise..."
          value={formData.issueDescription}
          onChange={(e) => updateField('issueDescription', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Urgency Level</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateField('urgency', 'standard')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.urgency === 'standard' ? 'border-charcoal-blue bg-blue-50/50 ring-2 ring-charcoal-blue' : 'border-gray-100 hover:border-gray-300'}`}
          >
            <div className="font-bold text-charcoal-blue">Standard</div>
            <div className="text-xs text-gray-500">Next available slot</div>
          </button>
          <button
            onClick={() => updateField('urgency', 'emergency')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.urgency === 'emergency' ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500' : 'border-gray-100 hover:border-red-200'}`}
          >
            <div className="font-bold text-red-600 flex items-center gap-2">
              Emergency
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>
            <div className="text-xs text-gray-500">24/7 Priority Dispatch</div>
          </button>
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={prevStep} className="w-1/3 text-gray-500 font-bold hover:text-charcoal-blue">BACK</button>
        <button
          onClick={nextStep}
          disabled={!formData.issueDescription}
          className="w-2/3 bg-charcoal-blue text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-dark-charcoal transition-all"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
