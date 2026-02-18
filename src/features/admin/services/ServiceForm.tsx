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
           <div className="bg-[#34495e]/30 p-6 rounded-2xl border border-[#ffffff08]">
              <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-4">Core Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">Service Title</label>
                  <input 
                    name="title" 
                    defaultValue={initialData?.title} 
                    required 
                    placeholder="e.g. Broken Spring Repair"
                    className="w-full bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white placeholder-[#547085] focus:border-[#f1c40f] focus:ring-1 focus:ring-[#f1c40f] outline-none transition-all"
                  />
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">Category</label>
                   <select 
                      name="category" 
                      defaultValue={initialData?.category || 'Residential'}
                      className="w-full bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white outline-none focus:border-[#f1c40f] transition-all appearance-none"
                   >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Design">Design</option>
                      <option value="Critical Response">Critical Response</option>
                   </select>
                </div>
              </div>
           </div>

           <div className="bg-[#34495e]/30 p-6 rounded-2xl border border-[#ffffff08]">
              <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-4">Pricing</h3>
              <div>
                  <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">Base Price ($)</label>
                  <input 
                    name="price" 
                    type="number" 
                    step="0.01"
                    defaultValue={initialData?.price} 
                    placeholder="0.00"
                    className="w-full bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white font-mono placeholder-[#547085] focus:border-[#f1c40f] outline-none transition-all"
                  />
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN - DESCRIPTION */}
        <div className="space-y-6">
           <div className="bg-[#34495e]/30 p-6 rounded-2xl border border-[#ffffff08] h-full flex flex-col">
              <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-4">Description</h3>
              <textarea 
                name="description" 
                defaultValue={getInitialDescription()}
                className="w-full flex-1 bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white placeholder-[#547085] focus:border-[#f1c40f] outline-none transition-all min-h-[200px]"
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
          className="px-6 py-3 rounded-xl border border-[#ffffff10] text-[#bdc3c7] font-bold hover:bg-[#ffffff05] transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="
            px-8 py-3 rounded-xl bg-[#f1c40f] text-[#2c3e50] font-bold uppercase tracking-wider
            shadow-[0_4px_20px_rgba(241,196,15,0.3)] hover:shadow-[0_6px_25px_rgba(241,196,15,0.5)] 
            hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </form>
  );
}
