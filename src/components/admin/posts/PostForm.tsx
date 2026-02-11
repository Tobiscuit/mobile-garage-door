'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MediaUpload from '@/components/admin/ui/MediaUpload';

interface PostFormProps {
  action: (formData: FormData) => Promise<any>;
  initialData?: any;
  buttonLabel: string;
}

export default function PostForm({ action, initialData, buttonLabel }: PostFormProps) {
  const router = useRouter();

  const [featuredImageId, setFeaturedImageId] = React.useState<string | null>(initialData?.featuredImage?.id || initialData?.featuredImage || null);

  // Helper to extract text from Lexical JSON if it exists
  const getInitialContent = () => {
    if (!initialData?.content) return '';
    // If string (from our simple create), return it
    if (typeof initialData.content === 'string') return initialData.content;
    // If Lexical JSON object
    try {
        // Very basic extraction: get the first paragraph text
        return initialData.content?.root?.children?.[0]?.children?.[0]?.text || '';
    } catch (e) {
        return '';
    }
  };

  const getInitialKeywords = () => {
    if (!initialData?.keywords) return '';
    return initialData.keywords.map((k: any) => k.keyword).join(', ');
  };

  return (
    <form action={action} className="max-w-6xl">
      <input type="hidden" name="featuredImage" value={featuredImageId || ''} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CONTENT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-2xl p-8 shadow-xl">
                 {/* TITLE */}
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">Article Title</label>
                    <input 
                      name="title"
                      type="text" 
                      defaultValue={initialData?.title}
                      required
                      className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-[#f1c40f] transition-colors"
                      placeholder="Enter a catchy title..."
                    />
                 </div>

                 {/* SLUG */}
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">Slug (URL)</label>
                    <div className="flex bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-gray-400">
                        <span className="select-none">/posts/</span>
                        <input 
                        name="slug"
                        type="text" 
                        defaultValue={initialData?.slug}
                        className="bg-transparent text-white focus:outline-none flex-1 ml-1"
                        placeholder="auto-generated-from-title"
                        />
                    </div>
                 </div>

                 {/* CONTENT (Simple Textarea for now, replacing RichText wrapper) */}
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">Content (Markdown / Text)</label>
                    <textarea 
                      name="content"
                      defaultValue={getInitialContent()}
                      required
                      rows={15}
                      className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#f1c40f] transition-colors"
                      placeholder="Write your article content here..."
                    />
                 </div>

                 {/* EXCERPT */}
                 <div>
                    <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">Short Summary (Excerpt)</label>
                    <textarea 
                      name="excerpt"
                      defaultValue={initialData?.excerpt}
                      rows={3}
                      className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f1c40f] transition-colors"
                      placeholder="Brief overview for SEO and previews..."
                    />
                 </div>
            </div>
            
             <div className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-2xl p-8 shadow-xl">
                 <h3 className="text-lg font-bold text-white mb-4">Search Optimization</h3>
                 {/* KEYWORDS */}
                 <div>
                    <label className="block text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-2">Keywords (Comma Separated)</label>
                    <input 
                      name="keywords"
                      type="text" 
                      defaultValue={getInitialKeywords()}
                      className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f1c40f] transition-colors"
                      placeholder="e.g. garage door repair, new installation, dallas"
                    />
                 </div>
             </div>
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-6">
            <div className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-2xl p-6 shadow-xl">
                <h3 className="text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-4 border-b border-[#ffffff10] pb-2">Publishing</h3>
                
                {/* STATUS */}
                <div className="mb-4">
                    <label className="block text-xs text-[#bdc3c7] mb-1">Status</label>
                    <select 
                        name="status"
                        defaultValue={initialData?.status || 'draft'}
                        className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f1c40f]"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                {/* PUBLISHED AT */}
                <div className="mb-6">
                    <label className="block text-xs text-[#bdc3c7] mb-1">Publish Date</label>
                    <input 
                        name="publishedAt"
                        type="date"
                        defaultValue={initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0] : ''}
                        className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f1c40f]"
                    />
                </div>

                {/* CATEGORY */}
                <div className="mb-6">
                    <label className="block text-xs text-[#bdc3c7] mb-1">Category</label>
                     <select 
                        name="category"
                        defaultValue={initialData?.category || 'repair-tips'}
                        className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#f1c40f]"
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
                        className="w-full py-3 bg-[#f1c40f] text-[#2c3e50] font-bold rounded-xl hover:bg-[#f39c12] hover:scale-105 transition-all shadow-[0_4px_20px_rgba(241,196,15,0.3)]"
                    >
                        {buttonLabel}
                    </button>
                    <button 
                        type="button"
                        onClick={() => router.back()}
                        className="w-full py-2 text-[#bdc3c7] font-bold hover:text-white transition-colors text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* FEATURED IMAGE */}
            <div className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-2xl p-6 shadow-xl">
                 <h3 className="text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-4 border-b border-[#ffffff10] pb-2">Featured Image</h3>
                 
                 <MediaUpload 
                    onUploadComplete={(doc) => setFeaturedImageId(doc.id)}
                    initialMedia={initialData?.featuredImage}
                 />
            </div>

            {/* AI NOTES */}
            <div className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-2xl p-6 shadow-xl">
                 <h3 className="text-xs font-bold text-[#bdc3c7] uppercase tracking-wider mb-4 border-b border-[#ffffff10] pb-2">AI Quick Notes</h3>
                 <textarea 
                      name="quickNotes"
                      defaultValue={initialData?.quickNotes}
                      rows={4}
                      className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#f1c40f] transition-colors resize-none"
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
  );
}
