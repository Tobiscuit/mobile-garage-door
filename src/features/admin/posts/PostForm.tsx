'use client';

import React, { useRef, useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import MediaUpload from '@/features/admin/ui/MediaUpload';
import { generatePostContent } from '@/actions/ai';
import { RichTextEditor } from '@/features/admin/ui/RichTextEditor';

interface PostFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
  initialData?: any;
  buttonLabel: string;
}

export default function PostForm({ action, initialData, buttonLabel }: PostFormProps) {
  const router = useRouter();

  const [featuredImageId, setFeaturedImageId] = React.useState<string | null>(initialData?.featuredImage?.id || initialData?.featuredImage || null);
  
  // React 19 Action State
  const [state, formAction, isPending] = useActionState(action, null);

  // AI State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Helper to convert Lexical JSON to HTML for Tiptap
  function lexicalToHtml(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (node.root) return lexicalToHtml(node.root);

    if (node.type === 'text') {
      let text = node.text || '';
      text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if (node.format & 1) text = `<strong>${text}</strong>`;
      if (node.format & 2) text = `<em>${text}</em>`;
      if (node.format & 8) text = `<u>${text}</u>`;
      if (node.format & 16) text = `<code>${text}</code>`;
      return text;
    }

    const childrenHtml = node.children ? node.children.map((child: any) => lexicalToHtml(child)).join('') : '';

    switch (node.type) {
      case 'root': return childrenHtml;
      case 'paragraph': return childrenHtml ? `<p>${childrenHtml}</p>` : '<p><br></p>';
      case 'heading': return `<${node.tag}>${childrenHtml}</${node.tag}>`;
      case 'list': return `<${node.listType === 'number' ? 'ol' : 'ul'}>${childrenHtml}</${node.listType === 'number' ? 'ol' : 'ul'}>`;
      case 'listitem': return `<li>${childrenHtml}</li>`;
      case 'quote': return `<blockquote>${childrenHtml}</blockquote>`;
      case 'link': return `<a href="${node.fields?.url}" target="${node.fields?.newTab ? '_blank' : '_self'}">${childrenHtml}</a>`;
      default: return childrenHtml;
    }
  }

  // Content State
  // Prefer htmlContent (from Adapter) if available, otherwise fallback to converting Lexical JSON to HTML
  const [content, setContent] = useState(initialData?.htmlContent || lexicalToHtml(initialData?.content));

  // Form Refs for direct manipulation of simple fields
  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const keywordsRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const getInitialKeywords = () => {
    if (!initialData?.keywords) return '';
    return initialData.keywords.map((k: any) => k.keyword).join(', ');
  };

  const handleAiGenerate = async () => {
      if (!aiPrompt) return;
      setIsAiLoading(true);
      try {
          const result = await generatePostContent(aiPrompt); // No format arg needed, returns HTML
          
          if (titleRef.current) titleRef.current.value = result.title || '';
          
          if (slugRef.current) {
              const slugSource = result.title || '';
              slugRef.current.value = slugSource.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          }
          
          if (excerptRef.current) excerptRef.current.value = result.excerpt || '';
          
          // Set Content (Tiptap)
          setContent(result.content || '');
          
          if (result.featuredImageId) {
             setFeaturedImageId(result.featuredImageId);
          }
          
          if (keywordsRef.current) {
               const keywords = result.keywords;
               keywordsRef.current.value = Array.isArray(keywords) ? keywords.join(', ') : (keywords || '');
          }
          
          if (categoryRef.current && result.category) {
              categoryRef.current.value = result.category;
          }

          setIsAiOpen(false);
          setAiPrompt('');
      } catch (e: any) {
          console.error('AI Error:', e);
          alert(`Failed to generate content: ${e.message || 'Unknown error'}`);
      } finally {
          setIsAiLoading(false);
      }
  };

  return (
    <div className="relative">
        {/* AI POPUP */}
        {isAiOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-6 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-black text-[var(--staff-accent)] mb-4 flex items-center gap-2">
                        <span>✨</span> AI Magic Writer
                    </h3>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">What should I write about?</label>
                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl p-3 text-[var(--staff-text)] focus:border-[var(--staff-accent)] outline-none min-h-[100px]"
                            placeholder="e.g. Write a guide about how to fix a noisy garage door opener..."
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setIsAiOpen(false)}
                            className="px-4 py-2 text-[var(--staff-muted)] hover:text-[var(--staff-text)] font-bold text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAiGenerate}
                            disabled={isAiLoading || !aiPrompt}
                            className="px-6 py-2 bg-[var(--staff-accent)] hover:opacity-90 text-[var(--staff-surface-alt)] font-black rounded-lg shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isAiLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Thinking...
                                </>
                            ) : (
                                <>
                                    <span>Generate</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

    <form action={formAction} className="max-w-6xl">
      <div className="flex justify-end mb-4">
          <button 
            type="button"
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] transition-all transform hover:-translate-y-1"
          >
             <span>✨</span> AI Magic Writer
          </button>
      </div>

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 text-red-500 font-bold animate-in fade-in slide-in-from-top-2">
            ⚠️ {state.error}
        </div>
      )}

      <input type="hidden" name="featuredImage" value={featuredImageId || ''} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CONTENT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-8 shadow-xl transition-colors duration-200">
                 {/* TITLE */}
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Article Title</label>
                    <input 
                      ref={titleRef}
                      name="title"
                      type="text" 
                      defaultValue={initialData?.title}
                      required
                      className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-4 py-3 text-[var(--staff-text)] text-xl font-bold focus:outline-none focus:border-[var(--staff-accent)] transition-colors"
                      placeholder="Enter a catchy title..."
                    />
                 </div>

                 {/* SLUG */}
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Slug (URL)</label>
                    <div className="flex bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-4 py-3 text-[var(--staff-muted)]">
                        <span className="select-none">/posts/</span>
                        <input 
                        ref={slugRef}
                        name="slug"
                        type="text" 
                        defaultValue={initialData?.slug}
                        className="bg-transparent text-[var(--staff-text)] focus:outline-none flex-1 ml-1"
                        placeholder="auto-generated-from-title"
                        />
                    </div>
                 </div>

                 {/* CONTENT EDITOR */}
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Content</label>
                    <RichTextEditor 
                        content={content} 
                        onChange={setContent} 
                    />
                    <input type="hidden" name="content" value={content} />
                 </div>

                 {/* EXCERPT */}
                 <div>
                    <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Short Summary (Excerpt)</label>
                    <textarea 
                      ref={excerptRef}
                      name="excerpt"
                      defaultValue={initialData?.excerpt}
                      rows={3}
                      className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-4 py-3 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)] transition-colors"
                      placeholder="Brief overview for SEO and previews..."
                    />
                 </div>
            </div>
            
             <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-8 shadow-xl transition-colors duration-200">
                 <h3 className="text-lg font-bold text-[var(--staff-accent)] mb-4">Search Optimization</h3>
                 {/* KEYWORDS */}
                 <div>
                    <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-2">Keywords (Comma Separated)</label>
                    <input 
                      ref={keywordsRef}
                      name="keywords"
                      type="text" 
                      defaultValue={getInitialKeywords()}
                      className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-4 py-3 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)] transition-colors"
                      placeholder="e.g. garage door repair, new installation, dallas"
                    />
                 </div>
             </div>
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-6">
            <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-6 shadow-xl transition-colors duration-200">
                <h3 className="text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-4 border-b border-[var(--staff-border)] pb-2">Publishing</h3>
                
                {/* STATUS */}
                <div className="mb-4">
                    <label className="block text-xs text-[var(--staff-muted)] mb-1">Status</label>
                    <select 
                        name="status"
                        defaultValue={initialData?.status || 'draft'}
                        className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-3 py-2 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)]"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                {/* PUBLISHED AT */}
                <div className="mb-6">
                    <label className="block text-xs text-[var(--staff-muted)] mb-1">Publish Date</label>
                    <input 
                        name="publishedAt"
                        type="date"
                        defaultValue={initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0] : ''}
                        className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-3 py-2 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)]"
                    />
                </div>

                {/* CATEGORY */}
                <div className="mb-6">
                    <label className="block text-xs text-[var(--staff-muted)] mb-1">Category</label>
                     <select 
                        ref={categoryRef}
                        name="category"
                        defaultValue={initialData?.category || 'repair-tips'}
                        className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-3 py-2 text-[var(--staff-text)] focus:outline-none focus:border-[var(--staff-accent)]"
                    >
                        <option value="repair-tips">Repair Tips</option>
                        <option value="product-spotlight">Product Spotlight</option>
                        <option value="contractor-insights">Contractor Insights</option>
                        <option value="maintenance-guide">Maintenance Guide</option>
                        <option value="industry-news">Industry News</option>
                    </select>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3">
                     <button 
                        type="submit"
                        className="w-full py-3 bg-[var(--staff-accent)] text-[var(--staff-surface-alt)] font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-[0_4px_20px_var(--staff-accent)]"
                    >
                        {isPending ? 'Saving...' : buttonLabel}
                    </button>
                    <button 
                        type="button"
                        onClick={() => router.back()}
                        className="w-full py-2 text-[var(--staff-muted)] font-bold hover:text-[var(--staff-text)] transition-colors text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* FEATURED IMAGE */}
            <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-6 shadow-xl transition-colors duration-200">
                 <h3 className="text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-4 border-b border-[var(--staff-border)] pb-2">Featured Image</h3>
                 
                 <MediaUpload 
                    onUploadComplete={(doc) => setFeaturedImageId(doc.id)}
                    initialMedia={initialData?.featuredImage}
                 />
            </div>

            {/* AI NOTES */}
            <div className="bg-[var(--staff-surface)] border border-[var(--staff-border)] rounded-2xl p-6 shadow-xl transition-colors duration-200">
                 <h3 className="text-xs font-bold text-[var(--staff-muted)] uppercase tracking-wider mb-4 border-b border-[var(--staff-border)] pb-2">AI Quick Notes</h3>
                 <textarea 
                      name="quickNotes"
                      defaultValue={initialData?.quickNotes}
                      rows={4}
                      className="w-full bg-[var(--staff-bg)] border border-[var(--staff-border)] rounded-xl px-3 py-2 text-[var(--staff-text)] text-sm focus:outline-none focus:border-[var(--staff-accent)] transition-colors resize-none"
                      placeholder="Ideas for AI expansion..."
                    />
                    <button type="button" className="w-full mt-2 py-2 bg-[#8e44ad] text-white text-xs font-bold rounded-lg hover:bg-[#9b59b6] transition-colors flex items-center justify-center gap-2 opacity-50 cursor-not-allowed" title="Coming Soon">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Generate with AI
                    </button>
            </div>
        </div>

      </div>
    </form>
    </div>
  );
}
