import React from 'react';
import Link from 'next/link';
import PostForm from '@/features/admin/posts/PostForm';
import { createPost } from '../actions';

export default function CreatePostPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/posts" className="text-[var(--staff-muted)] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Blog Posts
            </Link>
            <span className="text-[var(--staff-border)]">/</span>
            <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
            Create
            </span>
        </div>
        <h1 className="text-4xl font-black text-[var(--staff-text)]">Write New Article</h1>
      </div>

      <PostForm 
        action={createPost} 
        buttonLabel="Publish Post" 
      />
    </div>
  );
}
