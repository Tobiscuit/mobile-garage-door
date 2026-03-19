import { requireAdmin } from '@/lib/require-role';
import React from 'react';
import Link from '@/shared/ui/Link';
import PostForm from '@/features/admin/posts/PostForm';
import { createPost } from '../actions';

export default async function CreatePostPage() {
  await requireAdmin();
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/posts" className="text-[var(--staff-muted)] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Blog Posts
            </Link>
            <span className="text-[var(--staff-border)]">/</span>
            <span className="text-[#6366f1] text-sm font-bold uppercase tracking-widest">
            Generate
            </span>
        </div>
        <h1 className="text-4xl font-black text-[var(--staff-text)]">Generate New Article</h1>
        <p className="text-[var(--staff-muted)] mt-1">Use AI to generate a complete blog post — review and edit before publishing.</p>
      </div>

      <PostForm 
        action={createPost} 
        buttonLabel="Save Draft" 
        autoOpenAi={true}
      />
    </div>
  );
}
