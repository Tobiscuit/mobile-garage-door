'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function uploadMedia(formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No file provided' };
  }

  try {
    // Payload expects a precise structure for files via the Local API (especially with S3 adapter)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: (formData.get('alt') as string) || file.name || 'Dashboard Upload',
      },
      file: {
        data: buffer,
        name: file.name,
        mimetype: file.type,
        size: file.size,
      } as any
    });

    return { success: true, doc: media };
  } catch (error) {
    console.error('Upload Error:', error);
    return { error: 'Failed to upload image' };
  }
}
