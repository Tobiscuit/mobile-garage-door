'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function uploadMedia(formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  const file = formData.get('file');

  if (!file) {
    return { error: 'No file provided' };
  }

  try {
    // Payload 3.0 local API handles file uploads via the 'file' property in data
    // typically by passing the File object directly if using the Node API correctly
    // However, depending on the adapter, we might need to buffer it. 
    // For standard multipart forms passed to Server Actions, we can pass the FormData directly if the API supports it
    // or we use the 'create' method with the file property.
    
    // In Payload Local API, we pass the file object in the 'file' property
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: (formData.get('alt') as string) || 'Dashboard Upload',
      },
      file: file as any // Payload expects specific file-like object, standard File from FormData usually works in Node envs now
    });

    return { success: true, doc: media };
  } catch (error) {
    console.error('Upload Error:', error);
    return { error: 'Failed to upload image' };
  }
}
