'use client';

import React, { useState } from 'react';
import { createProject, updateProject } from '@/app/(site)/dashboard/projects/actions';
import MediaUpload from '@/features/admin/ui/MediaUpload';
import { RichTextEditor } from '@/features/admin/ui/RichTextEditor';
import { generateProjectCaseStudy } from '@/actions/ai';

interface ProjectFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverImage, setCoverImage] = useState<any>(initialData?.coverImage);
  const [aiPrompt, setAiPrompt] = useState('');

  // Rich Text State
  // Prefer htmlDescription (from Adapter) if available, otherwise fallback to plain text extraction
  const [description, setDescription] = useState(initialData?.htmlDescription || extractText(initialData?.description));
  const [challenge, setChallenge] = useState(initialData?.htmlChallenge || extractText(initialData?.challenge));
  const [solution, setSolution] = useState(initialData?.htmlSolution || extractText(initialData?.solution));
  
  // Basic Fields State (for AI population)
  const [title, setTitle] = useState(initialData?.title || '');
  const [client, setClient] = useState(initialData?.client || '');
  const [location, setLocation] = useState(initialData?.location || '');

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
        const result = await generateProjectCaseStudy(aiPrompt);
        if (result) {
            setTitle(result.title);
            setClient(result.client);
            setLocation(result.location);
            setDescription(result.description);
            setChallenge(result.challenge);
            setSolution(result.solution);
        }
    } catch (e) {
        console.error("AI Gen Failed", e);
        alert("Failed to generate content. Please check the API key.");
    } finally {
        setIsGenerating(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    // Append the media ID if available
    if (coverImage?.id) {
       formData.set('coverImage', coverImage.id);
    }

    // Since RichTextEditor doesn't use native inputs, the hidden inputs (see below) 
    // will automatically include these values in formData.
    // However, explicit set is safer if state updates lag slightly behind render in some edge cases.
    formData.set('description', description);
    formData.set('challenge', challenge);
    formData.set('solution', solution);
    formData.set('title', title);
    formData.set('client', client);
    formData.set('location', location);

    const result = isEdit && initialData?.id 
        ? await updateProject(initialData.id, formData)
        : await createProject(formData);

    if (result?.error) {
        alert(result.error);
        setIsLoading(false);
    }
    // If success, server action redirects, so we don't need to unset isLoading (component unmounts)
  }

  // Helper to extract text from Lexical JSON if it exists
  function extractText(field: any) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    try {
      if (field.root && field.root.children) {
        return field.root.children
          .map((child: any) => {
             if (child.children) {
                return child.children.map((c: any) => c.text).join('');
             }
             return '';
          })
          .join('\n');
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      {/* AI COPILOT CARD */}
      <div className="bg-[var(--staff-surface)] p-6 rounded-2xl border border-[#f1c40f]/20 relative overflow-hidden group shadow-lg shadow-black/5 transition-colors duration-200">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#f1c40f]/5 via-transparent to-transparent opacity-50"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#f1c40f]/10 rounded-lg border border-[#f1c40f]/20">
                    <svg className="w-5 h-5 text-[#f1c40f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs">AI Project Wizard</h3>
            </div>
            
            <div className="flex gap-4">
                <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Paste rough notes here (e.g., 'Installed a glass garage door for a modern home in Austin using high-lift tracks...')"
                    className="flex-1 bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[#f1c40f] focus:ring-1 focus:ring-[#f1c40f]/20 outline-none transition-all h-[80px] text-sm resize-none"
                />
                <button 
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt}
                    className="px-6 rounded-xl bg-[#f1c40f] hover:bg-[#f39c12] text-[#2c3e50] font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-auto shadow-[0_4px_10px_rgba(241,196,15,0.2)] hover:shadow-[0_6px_15px_rgba(241,196,15,0.3)] hover:-translate-y-0.5"
                >
                    {isGenerating ? (
                        <>
                           <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Generating...
                        </>
                    ) : (
                        <>Generate Case Study</>
                    )}
                </button>
            </div>
         </div>
      </div>

      <form action={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - MAIN CONTENT */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-[var(--staff-surface)] p-8 rounded-2xl border border-[var(--staff-border)] transition-colors duration-200">
                  <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-6">Project Details</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Project Title</label>
                      <input 
                        name="title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required 
                        placeholder="e.g. Modern Glass Garage Installation"
                        className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[#f1c40f] focus:ring-1 focus:ring-[#f1c40f] outline-none transition-all text-lg font-bold"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Client Name</label>
                            <input 
                                name="client" 
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                placeholder="e.g. The Smith Residence"
                                className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[#f1c40f] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Location</label>
                            <input 
                                name="location" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Austin, TX"
                                className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[#f1c40f] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Description / Case Study (Main)</label>
                       <RichTextEditor 
                          content={description} 
                          onChange={setDescription} 
                       />
                       <input type="hidden" name="description" value={description} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">The Challenge</label>
                            <RichTextEditor 
                              content={challenge} 
                              onChange={setChallenge} 
                            />
                            <input type="hidden" name="challenge" value={challenge} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Our Solution</label>
                            <RichTextEditor 
                              content={solution} 
                              onChange={setSolution} 
                            />
                            <input type="hidden" name="solution" value={solution} />
                        </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN - MEDIA & META */}
            <div className="space-y-6">
               {/* MEDIA UPLOAD CARD */}
               <div className="bg-[var(--staff-surface)] p-6 rounded-2xl border border-[var(--staff-border)] transition-colors duration-200">
                  <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-4">Project Media</h3>
                  <MediaUpload 
                    label="Cover Image"
                    initialMedia={coverImage}
                    onUploadComplete={(media) => setCoverImage(media)}
                  />
               </div>

               {/* DATES CARD */}
               <div className="bg-[var(--staff-surface)] p-6 rounded-2xl border border-[var(--staff-border)] transition-colors duration-200">
                  <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-4">Timeline</h3>
                  <div>
                      <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Completion Date</label>
                      <input 
                        name="completionDate" 
                        type="date"
                        defaultValue={initialData?.completionDate ? new Date(initialData.completionDate).toISOString().split('T')[0] : ''} 
                        className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] focus:border-[#f1c40f] outline-none transition-all"
                      />
                  </div>
               </div>
            </div>
          </div>

          {/* ACTIONS FOOTER */}
          <div className="mt-8 flex justify-end gap-4 border-t border-[var(--staff-border)] pt-6">
            <button 
              type="button" 
              onClick={() => window.history.back()}
              className="px-6 py-3 rounded-xl border border-[var(--staff-border)] text-[var(--staff-muted)] font-bold hover:bg-[var(--staff-border)] transition-all"
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
    </div>
  );
}
