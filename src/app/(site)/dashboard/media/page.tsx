import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import Image from 'next/image';
import QuickUpload from '@/features/admin/media/QuickUpload';

async function getMedia() {
  const payload = await getPayload({ config: configPromise });
  const results = await payload.find({
    collection: 'media',
    limit: 100,
    sort: '-createdAt',
  });
  return results.docs;
}

export default async function MediaPage() {
  const mediaItems = await getMedia();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard" className="text-[var(--staff-muted)] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
                Command Center
              </Link>
              <span className="text-[var(--staff-border)]">/</span>
              <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
                Content
              </span>
           </div>
           <h1 className="text-4xl font-black text-[var(--staff-text)]">Media Library</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* UPLOAD CARD */}
        <div className="col-span-1 md:col-span-1">
            <div className="bg-[var(--staff-surface)] backdrop-blur-md border border-[var(--staff-border)] p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-[var(--staff-text)]">Quick Upload</h3>
                <QuickUpload />
                <p className="text-xs text-[var(--staff-muted)] mt-2 text-center">
                    Note: Refresh page to see new uploads in the gallery.
                </p>
            </div>
        </div>

        {/* GALLERY GRID */}
        <div className="col-span-1 md:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems.map((item) => (
                    <div key={item.id} className="relative aspect-square group bg-[var(--staff-surface-alt)] rounded-xl overflow-hidden border border-[var(--staff-border)] hover:border-[#f1c40f] transition-all">
                        {item.url && (
                             <Image 
                                src={item.url} 
                                alt={item.alt || 'Media'} 
                                fill 
                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                             />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-xs text-white truncate font-bold">{item.alt}</p>
                            <p className="text-[10px] text-[#bdc3c7]">{((item.filesize || 0) / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
