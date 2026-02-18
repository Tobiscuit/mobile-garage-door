'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MediaUpload from '@/features/admin/ui/MediaUpload';

export default function QuickUpload() {
  const router = useRouter();

  return (
    <MediaUpload 
        label="Drop Image Here"
        onUploadComplete={(media) => {
            // Refresh the page to show the new upload in the list
            router.refresh();
        }} 
    />
  );
}
