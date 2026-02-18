import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostById, updatePost } from '../actions';
import PostForm from '@/features/admin/posts/PostForm';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const updateAction = updatePost.bind(null, id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/posts" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Blog Posts
            </Link>
            <span className="text-[#ffffff20]">/</span>
            <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
            Edit
            </span>
        </div>
        <h1 className="text-4xl font-black text-white">Edit Article</h1>
      </div>

      <PostForm 
        action={updateAction} 
        initialData={post}
        buttonLabel="Save Changes" 
      />
    </div>
  );
}
