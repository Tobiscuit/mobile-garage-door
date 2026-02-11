'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadMedia } from '@/app/(site)/admin/media/actions';

interface MediaUploadProps {
  onUploadComplete: (media: any) => void;
  initialMedia?: any;
  label?: string;
}

export default function MediaUpload({ onUploadComplete, initialMedia, label = 'Cover Image' }: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialMedia?.url || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', file.name);

    const result = await uploadMedia(formData);

    if (result.success && result.doc) {
      onUploadComplete(result.doc);
      setPreview(result.doc.url || objectUrl); // Confirm with actual URL
    } else {
      alert('Upload failed');
      setPreview(initialMedia?.url || null); // Revert
    }
    setIsUploading(false);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-[#bdc3c7] uppercase mb-2">{label}</label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full h-48 rounded-xl border-2 border-dashed border-[#ffffff10] 
          bg-[#1e2b38]/50 hover:bg-[#1e2b38] hover:border-[#f1c40f] 
          transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {preview ? (
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
             <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#ffffff05] flex items-center justify-center text-[#f1c40f]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <div className="text-[#bdc3c7] text-sm font-bold">Click to Upload</div>
             <div className="text-[#547085] text-xs mt-1">JPG, PNG, WebP up to 5MB</div>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f1c40f]"></div>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
}
