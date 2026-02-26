'use client';

import React, { useState } from 'react';
import { createProject, updateProject } from '@/app/(site)/dashboard/projects/actions';
import MediaUpload from '@/features/admin/ui/MediaUpload';
import { RichTextEditor } from '@/features/admin/ui/RichTextEditor';
import { generateProjectCaseStudy, generateMultimodalProjectCaseStudy, extractProjectContext } from '@/actions/ai';

interface ProjectFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Gallery State (Array of { image, caption })
  const [gallery, setGallery] = useState<{ image: any, caption: string }[]>(initialData?.gallery || []);

  // Rich Text State
  // Prefer htmlDescription (from Adapter) if available, otherwise fallback to converting Lexical JSON to HTML
  const [description, setDescription] = useState(initialData?.htmlDescription || lexicalToHtml(initialData?.description));
  const [challenge, setChallenge] = useState(initialData?.htmlChallenge || lexicalToHtml(initialData?.challenge));
  const [solution, setSolution] = useState(initialData?.htmlSolution || lexicalToHtml(initialData?.solution));
  
  // Versions History State (for Undo functionality)
  const [descriptionHistory, setDescriptionHistory] = useState<string[]>([]);
  const [challengeHistory, setChallengeHistory] = useState<string[]>([]);
  const [solutionHistory, setSolutionHistory] = useState<string[]>([]);
  const [titleHistory, setTitleHistory] = useState<string[]>([]);

  // Granular AI Prompts
  const [promptDescription, setPromptDescription] = useState('');
  const [promptChallenge, setPromptChallenge] = useState('');
  const [promptSolution, setPromptSolution] = useState('');
  const [promptTitle, setPromptTitle] = useState('');
  
  // Smart Context State
  const [smartContextPrompt, setSmartContextPrompt] = useState('');
  const [isExtractingContext, setIsExtractingContext] = useState(false);
  
  // Granular Loading State
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  // Basic Fields State (for AI population)
  const [title, setTitle] = useState(initialData?.title || '');
  const [client, setClient] = useState(initialData?.client || '');
  const [location, setLocation] = useState(initialData?.location || '');

  async function handleAiGenerate() {
    if (!aiPrompt.trim() && gallery.length === 0) return;
    setIsGenerating(true);
    try {
        let result;
        if (gallery.length > 0) {
            // Map the frontend gallery state into the format expected by the backend
            const imagesContext = gallery
                .filter(g => g.image?.url) // Only process uploaded images
                .map(g => ({
                    url: g.image.url,
                    mimeType: g.image.mimeType || 'image/webp',
                    caption: g.caption || ''
                }));
                
            result = await generateMultimodalProjectCaseStudy(imagesContext, aiPrompt);
        } else {
            result = await generateProjectCaseStudy(aiPrompt);
        }

        if (result) {
            if (result.title) setTitle(result.title);
            if (result.client) setClient(result.client);
            if (result.location) setLocation(result.location);
            if (result.description) setDescription(result.description);
            if (result.challenge) setChallenge(result.challenge);
            if (result.solution) setSolution(result.solution);
        }
    } catch (e) {
        console.error("AI Gen Failed", e);
        alert("Failed to generate content. Please check the API key.");
    } finally {
        setIsGenerating(false);
    }
  }

  async function handleGranularAiGenerate(
    field: 'description' | 'challenge' | 'solution' | 'title', 
    promptValue: string
  ) {
    if (!promptValue.trim()) return;
    setGeneratingField(field);

    try {
        const imagesContext = gallery
            .filter(g => g.image?.url)
            .map(g => ({
                url: g.image.url,
                mimeType: g.image.mimeType || 'image/webp',
                caption: g.caption || ''
            }));

        const existingContext = { description, challenge, solution, title };
        const result = await generateMultimodalProjectCaseStudy(imagesContext, promptValue, field, existingContext);

        if (result && result[field]) {
            // Push current state to history array before overwriting
            if (field === 'description') {
                setDescriptionHistory(prev => [...prev, description]);
                setDescription(result.description);
                setPromptDescription('');
            } else if (field === 'challenge') {
                setChallengeHistory(prev => [...prev, challenge]);
                setChallenge(result.challenge);
                setPromptChallenge('');
            } else if (field === 'solution') {
                setSolutionHistory(prev => [...prev, solution]);
                setSolution(result.solution);
                setPromptSolution('');
            } else if (field === 'title') {
                setTitleHistory(prev => [...prev, title]);
                setTitle(result.title);
                setPromptTitle('');
            }
        }
    } catch (e) {
        console.error(`AI Targeted Gen Failed for ${field}`, e);
        alert(`Failed to rewrite ${field}.`);
    } finally {
        setGeneratingField(null);
    }
  }

  const handleSmartContextExtract = async () => {
      if (!smartContextPrompt.trim()) return;
      setIsExtractingContext(true);
      try {
          const result = await extractProjectContext(smartContextPrompt);
          if (result.client) setClient(result.client);
          if (result.location) setLocation(result.location);
          setSmartContextPrompt('');
      } catch (e) {
          console.error("Smart Context Extraction failed", e);
          alert("Failed to extract context. Please try again.");
      } finally {
          setIsExtractingContext(false);
      }
  };

  const handleUndo = (field: 'description' | 'challenge' | 'solution' | 'title') => {
      if (field === 'description' && descriptionHistory.length > 0) {
          const previous = descriptionHistory[descriptionHistory.length - 1];
          setDescription(previous);
          setDescriptionHistory(prev => prev.slice(0, -1));
      } else if (field === 'challenge' && challengeHistory.length > 0) {
          const previous = challengeHistory[challengeHistory.length - 1];
          setChallenge(previous);
          setChallengeHistory(prev => prev.slice(0, -1));
      } else if (field === 'solution' && solutionHistory.length > 0) {
          const previous = solutionHistory[solutionHistory.length - 1];
          setSolution(previous);
          setSolutionHistory(prev => prev.slice(0, -1));
      } else if (field === 'title' && titleHistory.length > 0) {
          const previous = titleHistory[titleHistory.length - 1];
          setTitle(previous);
          setTitleHistory(prev => prev.slice(0, -1));
      }
  };

  const handleAddGalleryImage = (media: any) => {
    setGallery(prev => [...prev, { image: media, caption: '' }]);
  };

  const handleUpdateCaption = (index: number, caption: string) => {
    const newGallery = [...gallery];
    newGallery[index].caption = caption;
    setGallery(newGallery);
  };

  const handleRemoveGalleryItem = (index: number) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setGallery(newGallery);
  };

  const handleMoveGalleryItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === gallery.length - 1) return;
    
    const newGallery = [...gallery];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newGallery[index];
    newGallery[index] = newGallery[newIndex];
    newGallery[newIndex] = temp;
    setGallery(newGallery);
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    
    // Append the gallery stringified JSON mapping to Media IDs
    formData.set('gallery', JSON.stringify(
        gallery.map(g => ({ image: g.image?.id, caption: g.caption }))
    ));

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

  // Helper to convert Lexical JSON to HTML for Tiptap
  function lexicalToHtml(node: any): string {
    if (!node) return '';
    
    // Handle string input (legacy/simple)
    if (typeof node === 'string') return node;

    // Handle root object wrapper
    if (node.root) {
      return lexicalToHtml(node.root);
    }

    // Handle text nodes
    if (node.type === 'text') {
      let text = node.text || '';
      // Escape HTML special characters to prevent XSS/rendering issues
      text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
      if (node.format & 1) text = `<strong>${text}</strong>`;
      if (node.format & 2) text = `<em>${text}</em>`;
      if (node.format & 8) text = `<u>${text}</u>`;
      if (node.format & 16) text = `<code>${text}</code>`;
      return text;
    }

    // Process children first
    const childrenHtml = node.children ? node.children.map((child: any) => lexicalToHtml(child)).join('') : '';

    // Handle block elements
    switch (node.type) {
      case 'root':
        return childrenHtml;
      case 'paragraph':
        // Only render paragraph if it has content or children, otherwise Tiptap might treat it as empty
        return childrenHtml ? `<p>${childrenHtml}</p>` : '<p><br></p>'; 
      case 'heading':
        return `<${node.tag}>${childrenHtml}</${node.tag}>`;
      case 'list':
        const tag = node.listType === 'number' ? 'ol' : 'ul';
        return `<${tag}>${childrenHtml}</${tag}>`;
      case 'listitem':
        return `<li>${childrenHtml}</li>`;
      case 'quote':
        return `<blockquote>${childrenHtml}</blockquote>`;
      case 'link':
        return `<a href="${node.fields?.url}" target="${node.fields?.newTab ? '_blank' : '_self'}">${childrenHtml}</a>`;
      default:
        return childrenHtml;
    }
  }

  return (
    <div className="max-w-6xl animate-in fade-in duration-500 space-y-8">
      
      {/* AI COPILOT CARD */}
      <div className="bg-[var(--staff-surface)] p-6 rounded-2xl border border-[var(--staff-accent)]/20 relative overflow-hidden group shadow-lg shadow-black/5 transition-colors duration-200">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[var(--staff-accent)]/5 via-transparent to-transparent opacity-50"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--staff-accent)]/10 rounded-lg border border-[var(--staff-accent)]/20">
                    <svg className="w-5 h-5 text-[var(--staff-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-[var(--staff-accent)] font-bold uppercase tracking-widest text-xs">AI Project Wizard</h3>
            </div>
            
            <div className="flex gap-4">
                <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Paste rough notes here (e.g., 'Installed a glass garage door for a modern home in Austin using high-lift tracks...')"
                    className="flex-1 bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[var(--staff-accent)] focus:ring-1 focus:ring-[var(--staff-accent)]/20 outline-none transition-all h-[80px] text-sm resize-none"
                />
                <button 
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt}
                    className="px-6 rounded-xl bg-[var(--staff-accent)] hover:opacity-90 text-[var(--staff-surface-alt)] font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-auto shadow-[0_4px_10px_var(--staff-accent)] hover:shadow-[0_6px_15px_var(--staff-accent)] hover:-translate-y-0.5"
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

            <div className="mt-6 flex flex-col md:flex-row gap-6 border-t border-[var(--staff-border)]/50 pt-6">
                <div className="flex-1">
                   <h4 className="text-[var(--staff-muted)] font-bold uppercase tracking-widest text-[10px] mb-4">Project Gallery & AI Context Notes</h4>
                   <div className="space-y-4">
                       {gallery.map((item, index) => (
                       <div key={index} className="p-4 border border-[var(--staff-border)] rounded-xl bg-[var(--staff-bg)] space-y-3 relative group">
                           <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                               <button 
                                 type="button" 
                                 title="Move Up"
                                 disabled={index === 0}
                                 onClick={() => handleMoveGalleryItem(index, 'up')}
                                 className="p-1.5 bg-gray-500/10 text-gray-500 rounded-lg hover:bg-gray-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                               >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                               </button>
                               <button 
                                 type="button" 
                                 title="Move Down"
                                 disabled={index === gallery.length - 1}
                                 onClick={() => handleMoveGalleryItem(index, 'down')}
                                 className="p-1.5 bg-gray-500/10 text-gray-500 rounded-lg hover:bg-gray-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                               >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                               </button>
                               <button 
                                 type="button" 
                                 title="Remove"
                                 onClick={() => handleRemoveGalleryItem(index)}
                                 className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 ml-1"
                               >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                           </div>
                           
                           <div className="flex gap-4">
                               <div className="w-24 h-24 relative overflow-hidden rounded-lg bg-[var(--staff-surface)] border border-[var(--staff-border)]">
                                   <div className="absolute top-0 left-0 bg-[var(--staff-accent)] text-[var(--staff-surface-alt)] font-black px-2 py-0.5 rounded-br-lg text-[10px] z-10 shadow-sm">
                                      {index + 1}
                                   </div>
                                   {item.image?.url && (
                                       <img src={item.image.url} alt="Gallery item" className="object-cover w-full h-full" />
                                   )}
                               </div>
                               <div className="flex-1">
                                   <label className="block text-[10px] font-bold text-[var(--staff-muted)] uppercase mb-1">AI Context / Caption (Optional)</label>
                                   <textarea 
                                       value={item.caption}
                                       onChange={(e) => handleUpdateCaption(index, e.target.value)}
                                       placeholder="e.g. Broken torsion spring replaced with heavy duty steel..."
                                       className="w-full bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-lg p-3 text-[var(--staff-text)] text-sm focus:border-[var(--staff-accent)] outline-none transition-all h-[70px] resize-none"
                                   />
                               </div>
                           </div>
                       </div>
                   ))}
                   
                   <div className="pt-2">
                       <MediaUpload 
                         label="Add Photos to AI Gallery"
                         multiple={true}
                         onUploadComplete={handleAddGalleryImage}
                       />
                   </div>
                </div> {/* Closes space-y-4 */}
             </div> {/* Closes flex-1 */}
             
             {/* TIMELINE MOVED TO AI WIZARD */}
             <div className="w-full md:w-64 bg-[var(--staff-surface-alt)] p-4 rounded-xl border border-[var(--staff-border)]/50 shrink-0">
                    <h4 className="text-[var(--staff-accent)] font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Timeline
                    </h4>
                    <label className="block text-[10px] font-bold text-[var(--staff-muted)] uppercase mb-2">Completion Date</label>
                    <input 
                        name="completionDate" 
                        type="date"
                        defaultValue={initialData?.completionDate ? new Date(initialData.completionDate).toISOString().split('T')[0] : ''} 
                        className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-lg p-3 text-[var(--staff-text)] text-sm focus:border-[var(--staff-accent)] outline-none transition-all"
                    />
                </div>
            </div>
         </div>
      </div>

      <form action={handleSubmit}>
          <div className="w-full space-y-6">
            {/* MAIN CONTENT */}
            <div className="bg-[var(--staff-surface)] p-8 rounded-2xl border border-[var(--staff-border)] transition-colors duration-200">
               <h3 className="text-[var(--staff-accent)] font-bold uppercase tracking-widest text-xs mb-6">Project Details</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-[var(--staff-muted)] uppercase">Project Title</label>
                      </div>
                      <input 
                        name="title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required 
                        placeholder="e.g. Modern Glass Garage Installation"
                        className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[var(--staff-accent)] focus:ring-1 focus:ring-[var(--staff-accent)] outline-none transition-all text-lg font-bold"
                      />
                      <div className="mt-3 flex gap-2">
                           <input 
                               type="text"
                               value={promptTitle}
                               onChange={(e) => setPromptTitle(e.target.value)}
                               placeholder="AI Instructions... (e.g. 'Make it sound more luxurious')"
                               className="flex-1 bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-lg px-3 py-2 text-xs text-[var(--staff-text)] focus:border-[var(--staff-accent)] outline-none"
                           />
                           <button
                               type="button"
                               onClick={() => handleGranularAiGenerate('title', promptTitle)}
                               disabled={generatingField === 'title' || !promptTitle}
                               className="px-3 py-2 rounded-lg bg-[var(--staff-accent)]/10 text-[var(--staff-accent)] hover:bg-[var(--staff-accent)]/20 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1 border border-[var(--staff-accent)]/20"
                           >
                               {generatingField === 'title' ? 'Writing...' : 'Rewrite'}
                           </button>
                           {titleHistory.length > 0 && (
                               <button
                                   type="button"
                                   onClick={() => handleUndo('title')}
                                   className="px-3 py-2 rounded-lg border border-[var(--staff-border)] text-[var(--staff-muted)] hover:text-white font-bold text-xs transition-colors"
                               >
                                   Undo
                               </button>
                           )}
                       </div>
                    </div>
                    
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--staff-border)] to-transparent opacity-50 my-6"></div>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Client Name</label>
                                <input 
                                    name="client" 
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    placeholder="e.g. The Smith Residence"
                                    className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[var(--staff-accent)] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Location</label>
                                <input 
                                    name="location" 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Austin, TX"
                                    className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-4 text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:border-[var(--staff-accent)] outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* SMART CONTEXT FILL UI */}
                        <div className="relative group">
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] rounded-xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative flex gap-2 bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-xl p-2 items-center">
                                <span className="pl-3 pr-1 text-lg">✨</span>
                                <input 
                                    type="text"
                                    value={smartContextPrompt}
                                    onChange={(e) => setSmartContextPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSmartContextExtract())}
                                    placeholder="Missing context? Type naturally (e.g. 'This was for John Doe in North Dallas')"
                                    className="flex-1 bg-transparent px-2 py-2 text-sm text-[var(--staff-text)] placeholder-[var(--staff-muted)] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleSmartContextExtract}
                                    disabled={isExtractingContext || !smartContextPrompt}
                                    className="px-4 py-2 rounded-lg bg-[#8e2de2]/20 text-[#cda4ff] hover:bg-[#8e2de2]/30 font-bold text-xs transition-colors disabled:opacity-50"
                                >
                                    {isExtractingContext ? 'Extracting...' : 'Extract & Fill'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--staff-border)] to-transparent opacity-50 my-6"></div>

                    <div>
                       <div className="flex items-center justify-between mb-2">
                           <label className="text-xs font-bold text-[var(--staff-muted)] uppercase">Description / Case Study (Main)</label>
                       </div>
                       <RichTextEditor 
                          content={description} 
                          onChange={setDescription} 
                       />
                       
                       <div className="mt-3 flex gap-2">
                           <input 
                               type="text"
                               value={promptDescription}
                               onChange={(e) => setPromptDescription(e.target.value)}
                               placeholder="AI Instructions... (e.g. 'Make it sound more premium')"
                               className="flex-1 bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-lg px-3 py-2 text-xs text-[var(--staff-text)] focus:border-[var(--staff-accent)] outline-none"
                           />
                           <button
                               type="button"
                               onClick={() => handleGranularAiGenerate('description', promptDescription)}
                               disabled={generatingField === 'description' || !promptDescription}
                               className="px-3 py-2 rounded-lg bg-[var(--staff-accent)]/10 text-[var(--staff-accent)] hover:bg-[var(--staff-accent)]/20 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1 border border-[var(--staff-accent)]/20"
                           >
                               {generatingField === 'description' ? 'Writing...' : 'Rewrite'}
                           </button>
                           {descriptionHistory.length > 0 && (
                               <button
                                   type="button"
                                   onClick={() => handleUndo('description')}
                                   className="px-3 py-2 rounded-lg border border-[var(--staff-border)] text-[var(--staff-muted)] hover:text-white font-bold text-xs transition-colors"
                               >
                                   Undo
                               </button>
                           )}
                       </div>
                       
                       <input type="hidden" name="description" value={description} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">The Challenge</label>
                            <RichTextEditor 
                              content={challenge} 
                              onChange={setChallenge} 
                            />
                            
                            <div className="mt-3 flex gap-2">
                                <input 
                                    type="text"
                                    value={promptChallenge}
                                    onChange={(e) => setPromptChallenge(e.target.value)}
                                    placeholder="AI Instructions..."
                                    className="flex-1 bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-lg px-3 py-2 text-xs text-[var(--staff-text)] focus:border-[var(--staff-accent)] outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleGranularAiGenerate('challenge', promptChallenge)}
                                    disabled={generatingField === 'challenge' || !promptChallenge}
                                    className="px-3 py-2 rounded-lg bg-[var(--staff-accent)]/10 text-[var(--staff-accent)] hover:bg-[var(--staff-accent)]/20 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1 border border-[var(--staff-accent)]/20"
                                >
                                    {generatingField === 'challenge' ? '...' : 'Rewrite'}
                                </button>
                                {challengeHistory.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleUndo('challenge')}
                                        className="px-2 py-2 rounded-lg border border-[var(--staff-border)] text-[var(--staff-muted)] hover:text-white font-bold text-xs transition-colors"
                                    >
                                        Undo
                                    </button>
                                )}
                            </div>

                            <input type="hidden" name="challenge" value={challenge} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">Our Solution</label>
                            <RichTextEditor 
                              content={solution} 
                              onChange={setSolution} 
                            />
                            
                            <div className="mt-3 flex gap-2">
                                <input 
                                    type="text"
                                    value={promptSolution}
                                    onChange={(e) => setPromptSolution(e.target.value)}
                                    placeholder="AI Instructions..."
                                    className="flex-1 bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-lg px-3 py-2 text-xs text-[var(--staff-text)] focus:border-[var(--staff-accent)] outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleGranularAiGenerate('solution', promptSolution)}
                                    disabled={generatingField === 'solution' || !promptSolution}
                                    className="px-3 py-2 rounded-lg bg-[var(--staff-accent)]/10 text-[var(--staff-accent)] hover:bg-[var(--staff-accent)]/20 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1 border border-[var(--staff-accent)]/20"
                                >
                                    {generatingField === 'solution' ? '...' : 'Rewrite'}
                                </button>
                                {solutionHistory.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleUndo('solution')}
                                        className="px-2 py-2 rounded-lg border border-[var(--staff-border)] text-[var(--staff-muted)] hover:text-white font-bold text-xs transition-colors"
                                    >
                                        Undo
                                    </button>
                                )}
                            </div>

                            <input type="hidden" name="solution" value={solution} />
                        </div>
                    </div>
                  </div>
               </div>
            </div>

          {/* ACTIONS FOOTER */}
          <div className="mt-8 flex justify-end gap-4 border-t border-[var(--staff-border)] pt-6">
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
              {isLoading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
            </button>
          </div>
      </form>
    </div>
  );
}
