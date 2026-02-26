'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadMedia } from '@/app/(site)/dashboard/media/actions';

interface MediaUploadProps {
  onUploadComplete: (media: any) => void;
  initialMedia?: any;
  label?: string;
  multiple?: boolean;
}

export default function MediaUpload({ onUploadComplete, initialMedia, label = 'Cover Image', multiple = false }: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialMedia?.url || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Show local preview immediately only if it's a single upload
    if (!multiple) {
        const objectUrl = URL.createObjectURL(files[0]);
        setPreview(objectUrl);
    }
    
    setIsUploading(true);

    // Upload files sequentially
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt', file.name);

        const result = await uploadMedia(formData);

        if (result.success && result.doc) {
            onUploadComplete(result.doc);
            if (!multiple) setPreview((typeof result.doc.url === 'string' ? result.doc.url : null));
        } else {
            alert(`Upload failed for ${file.name}`);
            if (!multiple) {
                const fallbackUrl = initialMedia?.url;
                setPreview(typeof fallbackUrl === 'string' ? fallbackUrl : null);
            }
        }
    }
    
    // Clear input so the same file(s) can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUploading(false);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-[var(--staff-muted)] uppercase mb-2">{label}</label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full h-48 rounded-xl border-2 border-dashed 
          transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden hover:border-[var(--staff-accent)]
          bg-[var(--staff-surface-alt)] hover:bg-[var(--staff-surface)] 
          transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {preview && !multiple ? (
          <div className="relative w-full h-full group">
            <Image 
              src={preview} 
              alt="Preview" 
              fill 
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-white font-bold text-sm">Change Image</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
             <div className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center text-[var(--staff-accent)]" style={{ backgroundColor: 'var(--staff-surface)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <div className="text-sm font-bold" style={{ color: 'var(--staff-muted)' }}>Click to Upload</div>
             <div className="text-xs mt-1" style={{ color: 'var(--staff-muted)' }}>JPG, PNG, WebP up to 5MB</div>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--staff-accent)]"></div>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
        multiple={multiple}
      />
    </div>
  );
}
