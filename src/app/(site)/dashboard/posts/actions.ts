'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(prevState: any, formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string; // This is now HTML from Tiptap
  const category = formData.get('category') as any;
  const status = formData.get('status') as any;
  
  // Payload Postgres expects numeric IDs, but FormData is strictly strings.
  const featuredImageRaw = formData.get('featuredImage') as string;
  const featuredImage = featuredImageRaw ? (isNaN(Number(featuredImageRaw)) ? featuredImageRaw : Number(featuredImageRaw)) : null;

  const quickNotes = formData.get('quickNotes') as string;
  const publishedAt = formData.get('publishedAt') as string;

  // Handle Keywords (Comma separated string -> Array of objects)
  const keywordsString = formData.get('keywords') as string;
  const keywords = keywordsString 
    ? keywordsString.split(',').map(k => ({ keyword: k.trim() })) 
    : [];

  try {
    await payload.create({
      collection: 'posts',
      data: {
        title,
        slug,
        excerpt,
        // Adapter Pattern: Send HTML to htmlContent, hook converts to Lexical 'content'
        htmlContent: content, 
        category,
        status,
        featuredImage,
        quickNotes,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        keywords,
      } as any,
    });
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Failed to create post' };
  }

  revalidatePath('/dashboard/posts');
  revalidatePath('/blog');
  redirect('/dashboard/posts');
}

export async function updatePost(id: string, prevState: any, formData: FormData) {
  const payload = await getPayload({ config: configPromise });

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string; // This is now HTML from Tiptap
  const category = formData.get('category') as any;
  const status = formData.get('status') as any;
  
  // Payload Postgres expects numeric IDs, but FormData is strictly strings.
  const featuredImageRaw = formData.get('featuredImage') as string;
  const featuredImage = featuredImageRaw ? (isNaN(Number(featuredImageRaw)) ? featuredImageRaw : Number(featuredImageRaw)) : null;

  const quickNotes = formData.get('quickNotes') as string;
  const publishedAt = formData.get('publishedAt') as string;

  const keywordsString = formData.get('keywords') as string;
  const keywords = keywordsString 
    ? keywordsString.split(',').map(k => ({ keyword: k.trim() })) 
    : [];

  try {
    await payload.update({
      collection: 'posts',
      id,
      data: {
        title,
        slug,
        excerpt,
        // Adapter Pattern: Send HTML to htmlContent, hook converts to Lexical 'content'
        htmlContent: content,
        category,
        status,
        featuredImage,
        quickNotes,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        keywords,
      } as any,
    });
  } catch (error) {
    console.error('Update Error:', error);
    return { error: 'Failed to update post' };
  }

  revalidatePath('/dashboard/posts');
  redirect('/dashboard/posts');
}

export async function getPostById(id: string) {
  const payload = await getPayload({ config: configPromise });
  try {
    const post = await payload.findByID({
      collection: 'posts',
      id,
    });
    return post;
  } catch (error) {
    return null;
  }
}

export async function getPosts() {
  const payload = await getPayload({ config: configPromise });
  
  const results = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    sort: '-publishedAt',
  });

  return results.docs;
}
