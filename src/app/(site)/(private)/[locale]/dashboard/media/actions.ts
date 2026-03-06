'use server';

import { getDB } from "@/db";
import { media } from "@/db/schema";
import { getCloudflareContext } from "@/lib/cloudflare";

export async function uploadMedia(formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No file provided' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to R2
    const key = `media/${Date.now()}-${file.name}`;
    await env.MEDIA_BUCKET.put(key, buffer, {
        httpMetadata: { contentType: file.type }
    });

    const url = `/media/${key}`; // Local proxy or direct R2 if configured

    const newMedia = await db.insert(media).values({
        filename: file.name,
        mimeType: file.type,
        filesize: file.size,
        alt: (formData.get('alt') as string) || file.name || 'Dashboard Upload',
        url,
    }).returning();

    return { success: true, doc: newMedia[0] };
  } catch (error) {
    console.error('Upload Error:', error);
    return { error: 'Failed to upload image' };
  }
}
