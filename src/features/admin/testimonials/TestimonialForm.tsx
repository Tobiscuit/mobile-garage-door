'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface TestimonialFormProps {
  action: (formData: FormData) => Promise<any>;
  initialData?: any;
  buttonLabel: string;
}

export default function TestimonialForm({ action, initialData, buttonLabel }: TestimonialFormProps) {
  const router = useRouter();

  return (
    <form action={action} className="max-w-4xl">
      <div className="bg-[var(--staff-surface)] backdrop-blur-md border border-[var(--staff-border)] rounded-2xl p-8 shadow-xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* AUTHOR */}
          <div>
            <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Customer Name</label>
            <input 
              name="author"
              type="text" 
              defaultValue={initialData?.author}
              required
              className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-4 py-3 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)] transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Location</label>
            <input 
              name="location"
              type="text" 
              defaultValue={initialData?.location}
              required
              className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-4 py-3 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)] transition-colors"
              placeholder="e.g. Dallas, TX"
            />
          </div>
        </div>

        {/* QUOTE */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Review Text</label>
          <textarea 
            name="quote"
            defaultValue={initialData?.quote}
            required
            rows={4}
            className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-4 py-3 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)] transition-colors"
            placeholder="What did they say?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* RATING */}
            <div>
                <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Rating (1-5)</label>
                <div className="relative">
                    <select 
                        name="rating"
                        defaultValue={initialData?.rating || 5}
                        className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-4 py-3 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)] transition-colors appearance-none"
                    >
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--staff-muted)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            {/* FEATURED TOGGLE */}
            <div className="flex items-center gap-4 pt-6">
                <input 
                    name="featured"
                    type="checkbox"
                    id="featured"
                    defaultChecked={initialData?.featured}
                    className="w-6 h-6 rounded border-[var(--staff-border)] bg-[var(--staff-bg)] text-[var(--staff-accent)] focus:ring-[var(--staff-accent)]"
                />
                <label htmlFor="featured" className="text-sm font-bold text-[var(--staff-text)] cursor-pointer">
                    Show on Homepage?
                </label>
            </div>
        </div>


        {/* ACTIONS */}
        <div className="flex justify-end gap-4 pt-6 border-t border-[var(--staff-border)]">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-[var(--staff-muted)] font-bold hover:text-[var(--staff-text)] transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-8 py-3 bg-[var(--staff-accent)] text-[var(--staff-surface-alt)] font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-[0_4px_20px_var(--staff-accent)]"
          >
            {buttonLabel}
          </button>
        </div>

      </div>
    </form>
  );
}
