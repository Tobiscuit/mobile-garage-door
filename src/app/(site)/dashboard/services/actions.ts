'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';

export async function getServices() {
  const payload = await getPayload({ config: configPromise });
  
  const results = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 100, // Pagination can be added later
    sort: '-createdAt', // Default sort
  });

  return results.docs;
}

export async function deleteService(id: string) {
  const payload = await getPayload({ config: configPromise });
  
  try {
    await payload.delete({
      collection: 'services',
      id,
    });
    revalidatePath('/dashboard/services');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete service:', error);
    return { success: false, error: 'Failed to delete service' };
  }
}
