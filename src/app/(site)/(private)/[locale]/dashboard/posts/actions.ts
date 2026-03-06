'use server';

import { getDB } from "@/db";
import { posts, postKeywords } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCloudflareContext } from "@/lib/cloudflare";

export async function createPost(prevState: any, formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const status = formData.get('status') as "draft" | "published";
  
  const featuredImageRaw = formData.get('featuredImage') as string;
  const featuredImageId = featuredImageRaw ? parseInt(featuredImageRaw) : null;

  const quickNotes = formData.get('quickNotes') as string;
  const publishedAt = formData.get('publishedAt') as string;

  const keywordsString = formData.get('keywords') as string;
  const keywordList = keywordsString
    ? keywordsString.split(',').map(k => k.trim())
    : [];

  try {
    const newPosts = await db.insert(posts).values({
        title,
        slug,
        excerpt,
        htmlContent: content,
        category,
        status,
        featuredImageId,
        quickNotes,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
    }).returning();

    const newPost = newPosts[0];

    if (keywordList.length > 0) {
        await db.insert(postKeywords).values(
            keywordList.map(keyword => ({
                postId: newPost.id,
                keyword
            }))
        );
    }
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Failed to create post' };
  }

  revalidatePath('/dashboard/posts');
  revalidatePath('/blog');
  redirect('/dashboard/posts');
}

export async function updatePost(id: string, prevState: any, formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const status = formData.get('status') as "draft" | "published";
  
  const featuredImageRaw = formData.get('featuredImage') as string;
  const featuredImageId = featuredImageRaw ? parseInt(featuredImageRaw) : null;

  const quickNotes = formData.get('quickNotes') as string;
  const publishedAt = formData.get('publishedAt') as string;

  const keywordsString = formData.get('keywords') as string;
  const keywordList = keywordsString
    ? keywordsString.split(',').map(k => k.trim())
    : [];

  try {
    const postId = parseInt(id);
    await db.update(posts).set({
        title,
        slug,
        excerpt,
        htmlContent: content,
        category,
        status,
        featuredImageId,
        quickNotes,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        updatedAt: new Date().toISOString()
    }).where(eq(posts.id, postId));

    // Simple keyword sync: delete and re-insert
    await db.delete(postKeywords).where(eq(postKeywords.postId, postId));
    if (keywordList.length > 0) {
        await db.insert(postKeywords).values(
            keywordList.map(keyword => ({
                postId,
                keyword
            }))
        );
    }
  } catch (error) {
    console.error('Update Error:', error);
    return { error: 'Failed to update post' };
  }

  revalidatePath('/dashboard/posts');
  redirect('/dashboard/posts');
}

export async function getPostById(id: string) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  try {
    const postId = parseInt(id);
    return db.query.posts.findFirst({
        where: eq(posts.id, postId),
        with: {
            keywords: true,
            featuredImage: true
        }
    });
  } catch (error) {
    return null;
  }
}

export async function getPosts() {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  return db.query.posts.findMany({
    orderBy: [desc(posts.publishedAt)],
    with: {
        featuredImage: true
    }
  });
}
