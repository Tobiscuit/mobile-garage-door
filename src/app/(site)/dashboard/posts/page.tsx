
import React from 'react';
import Link from 'next/link';
import { getPosts } from './actions';
import { DataTable } from '@/features/admin/ui/DataTable';
import { Post } from '@/payload-types';

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER */}
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
           <h1 className="text-4xl font-black text-[var(--staff-text)]">Blog Posts</h1>
        </div>

        <Link 
          href="/dashboard/posts/create" 
          className="
            flex items-center gap-2 bg-[#f1c40f] text-[#2c3e50] font-bold px-6 py-3 rounded-xl 
            shadow-[0_4px_20px_rgba(241,196,15,0.3)] hover:shadow-[0_6px_25px_rgba(241,196,15,0.5)] 
            hover:-translate-y-1 transition-all duration-300
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Write Post</span>
        </Link>
      </div>

      {/* DATA TABLE */}
      <DataTable 
        data={posts}
        columns={[
          {
            header: 'Title',
            cell: (item: any) => (
               <div>
                  <div className="font-bold text-lg text-[var(--staff-text)] group-hover:text-[#f1c40f] transition-colors line-clamp-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-[var(--staff-muted)]">/{item.slug}</div>
               </div>
            )
          },
          {
            header: 'Category',
            cell: (item: any) => (
                <span className="inline-block px-3 py-1 rounded-md bg-[var(--staff-surface-alt)] border border-[var(--staff-border)] text-xs font-bold text-[var(--staff-muted)]">
                    {item.category || 'Uncategorized'}
                </span>
            )
          },
          {
             header: 'Status',
             cell: (item: any) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'published' ? 'bg-[#2ecc71]' : 'bg-[#95a5a6]'}`}></div>
                     <span className={`text-xs font-bold uppercase tracking-wider ${item.status === 'published' ? 'text-[#2ecc71]' : 'text-[#95a5a6]'}`}>
                        {item.status || 'Draft'}
                    </span>
                </div>
             )
          },
          {
            header: 'Published',
            cell: (item: any) => (
                <div className="text-sm text-[var(--staff-muted)]">
                   {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}
                </div>
            )
          },
          {
            header: '',
            className: 'text-right',
            cell: (item: any) => (
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Link 
                    href={`/dashboard/posts/${item.id}`}
                    className="p-2 bg-[var(--staff-surface-alt)] hover:bg-[#f1c40f] hover:text-[#2c3e50] rounded-lg transition-colors"
                    title="Edit Post"
                 >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                 </Link>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
