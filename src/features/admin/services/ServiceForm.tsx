'use client';

import React, { useState } from 'react';
import { createService, updateService } from '@/app/(site)/dashboard/services/actions';

interface ServiceFormProps {
  initialData?: any; // strict type can be added from payload-types
  isEdit?: boolean;
}

export default function ServiceForm({ initialData, isEdit = false }: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Helper to extract text from Lexical JSON if it exists
  const getInitialDescription = () => {
    if (!initialData?.description) return '';
    // If string (from our simple create), return it
    if (typeof initialData.description === 'string') return initialData.description;
    // If Lexical JSON object
    try {
        // Very basic extraction: get the first paragraph text
        return initialData.description?.root?.children?.[0]?.children?.[0]?.text || '';
    } catch (e) {
        return '';
    }
  };

  // Wrapper to handle submit and loading state
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    if (isEdit && initialData?.id) {
       await updateService(initialData.id, formData);
    } else {
       await createService(formData);
    }
    // Redirect happens on server, so we might not need to set loading false implies unmount
  }

  return (
    <form action={handleSubmit} className="max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN - MAIN INFO */}
        <div className="space-y-6">
           <div className="bg-[var(--staff-surface-alt)] p-6 rounded-2xl border border-[var(--staff-border)]">
              <h3 className="text-[var(--staff-accent)] font-bold uppercase tracking-widest text-xs mb-4">Core Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Service Title</label>
                  <input 
                    name="title" 
                    defaultValue={initialData?.title} 
                    required 
                    placeholder="e.g. Broken Spring Repair"
                    className="w-full bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[var(--staff-accent)] focus:ring-1 focus:ring-[var(--staff-accent)] outline-none transition-all"
                  />
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Category</label>
                   <select 
                      name="category" 
                      defaultValue={initialData?.category || 'Residential'}
                      className="w-full bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] outline-none focus:border-[var(--staff-accent)] transition-all appearance-none"
                   >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Design">Design</option>
                      <option value="Critical Response">Critical Response</option>
                   </select>
                </div>
              </div>
           </div>

           <div className="bg-[var(--staff-surface-alt)] p-6 rounded-2xl border border-[var(--staff-border)]">
              <h3 className="text-[var(--staff-accent)] font-bold uppercase tracking-widest text-xs mb-4">Pricing</h3>
              <div>
                  <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Base Price ($)</label>
                  <input 
                    name="price" 
                    type="number" 
                    step="0.01"
                    defaultValue={initialData?.price} 
                    placeholder="0.00"
                    className="w-full bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] font-mono placeholder-[var(--staff-muted)] focus:border-[var(--staff-accent)] outline-none transition-all"
                  />
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN - DESCRIPTION */}
        <div className="space-y-6">
           <div className="bg-[var(--staff-surface-alt)] p-6 rounded-2xl border border-[var(--staff-border)] h-full flex flex-col">
              <h3 className="text-[var(--staff-accent)] font-bold uppercase tracking-widest text-xs mb-4">Description</h3>
              <textarea 
                name="description" 
                defaultValue={getInitialDescription()}
                className="w-full flex-1 bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[var(--staff-accent)] outline-none transition-all min-h-[200px]"
                placeholder="Detailed description of the service..."
              />
           </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-8 flex justify-end gap-4 border-t border-[#ffffff08] pt-6">
        <button 
          type="button" 
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-xl border border-[var(--staff-border)] text-[var(--staff-muted)] font-bold hover:text-[var(--staff-text)] transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="
            px-8 py-3 rounded-xl bg-[var(--staff-accent)] text-[var(--staff-surface-alt)] font-bold uppercase tracking-wider
            shadow-[0_4px_20px_var(--staff-accent)] hover:shadow-[0_6px_25px_var(--staff-accent)] 
            hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </form>
  );
}
