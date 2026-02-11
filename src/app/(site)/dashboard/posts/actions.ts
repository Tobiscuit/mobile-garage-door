'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string; // Treated as simple text/JSON for now
  const category = formData.get('category') as any;
  const status = formData.get('status') as any;
  const featuredImage = formData.get('featuredImage') as string;
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
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: content || '',
                    type: 'text',
                    version: 1,
                  }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          }
        }, // Simple Lexical Structure Mock
        category,
        status,
        featuredImage: featuredImage || null,
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
  redirect('/dashboard/posts');
}

export async function updatePost(id: string, formData: FormData) {
  const payload = await getPayload({ config: configPromise });

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as any;
  const status = formData.get('status') as any;
  const featuredImage = formData.get('featuredImage') as string;
  const quickNotes = formData.get('quickNotes') as string;
  const publishedAt = formData.get('publishedAt') as string;

  const keywordsString = formData.get('keywords') as string;
  const keywords = keywordsString 
    ? keywordsString.split(',').map(k => ({ keyword: k.trim() })) 
    : [];

  try {
    // Check if content is a JSON string (existing lexical) or plain text (edit)
    // For simplicity in this bespoke form, we are treating input as plain text and wrapping it again
    // In a real app, we'd parse the existing JSON and update it.
    // Here we just overwrite with a new simple paragraph.
    
    await payload.update({
      collection: 'posts',
      id,
      data: {
        title,
        slug,
        excerpt,
        content: {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: content || '',
                      type: 'text',
                      version: 1,
                    }
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1,
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'root',
              version: 1,
            }
          }, 
        category,
        status,
        featuredImage: featuredImage || null,
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
