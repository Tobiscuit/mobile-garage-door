'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createService(formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as 'Design' | 'Commercial' | 'Residential' | 'Critical Response'; // Type safety match
  const price = formData.get('price') as string;
  try {
    await payload.create({
      collection: 'services',
      data: {
        title,
        description,
        category,
        price: parseFloat(price) || 0,
      } as any,
    });
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Failed to create service' };
  }

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services');
}

export async function updateService(id: string, formData: FormData) {
  const payload = await getPayload({ config: configPromise });

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as any;
  const price = formData.get('price') as string;

  try {
    await payload.update({
      collection: 'services',
      id,
      data: {
        title,
        description,
        category,
        price: parseFloat(price) || 0,
      } as any,
    });
  } catch (error) {
    console.error('Update Error:', error);
    return { error: 'Failed to update service' };
  }

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services');
}

export async function getServiceById(id: string) {
  const payload = await getPayload({ config: configPromise });
  try {
    const service = await payload.findByID({
      collection: 'services',
      id,
    });
    return service;
  } catch (error) {
    return null;
  }
}

export async function getServices() {
  const payload = await getPayload({ config: configPromise });
  
  const results = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
  });

  return results.docs;
}
