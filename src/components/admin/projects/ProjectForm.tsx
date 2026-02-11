'use client';

import React, { useState } from 'react';
import { createProject, updateProject } from '@/app/(site)/admin/projects/actions';
import MediaUpload from '@/components/admin/ui/MediaUpload';

interface ProjectFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<any>(initialData?.coverImage);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    // Append the media ID if available
    if (coverImage?.id) {
       formData.set('coverImage', coverImage.id);
    }

    if (isEdit && initialData?.id) {
       await updateProject(initialData.id, formData);
    } else {
       await createProject(formData);
    }
  }

  return (
    <form action={handleSubmit} className="max-w-6xl animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-[#34495e]/30 p-8 rounded-2xl border border-[#ffffff08]">
              <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-6">Project Details</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">Project Title</label>
                  <input 
                    name="title" 
                    defaultValue={initialData?.title} 
                    required 
                    placeholder="e.g. Modern Glass Garage Installation"
                    className="w-full bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white placeholder-[#547085] focus:border-[#f1c40f] focus:ring-1 focus:ring-[#f1c40f] outline-none transition-all text-lg font-bold"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">Client Name</label>
                        <input 
                            name="client" 
                            defaultValue={initialData?.client} 
                            placeholder="e.g. The Smith Residence"
                            className="w-full bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white placeholder-[#547085] focus:border-[#f1c40f] outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">Location</label>
                        <input 
                            name="location" 
                            defaultValue={initialData?.location} 
                            placeholder="e.g. Austin, TX"
                            className="w-full bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white placeholder-[#547085] focus:border-[#f1c40f] outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">Description / Case Study</label>
                   <textarea 
                     name="description" 
                     defaultValue={initialData?.description}
                     className="w-full bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white placeholder-[#547085] focus:border-[#f1c40f] outline-none transition-all min-h-[300px] font-mono text-sm leading-relaxed"
                     placeholder="Detailed description of the project, challenges, and solution..."
                   />
                </div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN - MEDIA & META */}
        <div className="space-y-6">
           {/* MEDIA UPLOAD CARD */}
           <div className="bg-[#34495e]/30 p-6 rounded-2xl border border-[#ffffff08]">
              <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-4">Project Media</h3>
              <MediaUpload 
                label="Cover Image"
                initialMedia={coverImage}
                onUploadComplete={(media) => setCoverImage(media)}
              />
           </div>

           {/* DATES CARD */}
           <div className="bg-[#34495e]/30 p-6 rounded-2xl border border-[#ffffff08]">
              <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-4">Timeline</h3>
              <div>
                  <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">Completion Date</label>
                  <input 
                    name="completionDate" 
                    type="date"
                    defaultValue={initialData?.completionDate ? new Date(initialData.completionDate).toISOString().split('T')[0] : ''} 
                    className="w-full bg-[#1e2b38]/80 border border-[#ffffff10] rounded-xl p-4 text-white focus:border-[#f1c40f] outline-none transition-all"
                  />
              </div>
           </div>
        </div>
      </div>

      {/* ACTIONS FOOTER */}
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
          {isLoading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
