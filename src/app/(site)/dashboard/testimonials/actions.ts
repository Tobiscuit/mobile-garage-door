'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTestimonial(formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  
  const author = formData.get('author') as string;
  const location = formData.get('location') as string;
  const quote = formData.get('quote') as string;
  const rating = formData.get('rating') as string;
  const featured = formData.get('featured') === 'on';

  try {
    await payload.create({
      collection: 'testimonials',
      data: {
        author,
        location,
        quote,
        rating: parseFloat(rating) || 5,
        featured,
      } as any,
    });
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Failed to create testimonial' };
  }

  revalidatePath('/dashboard/testimonials');
  redirect('/dashboard/testimonials');
}

export async function updateTestimonial(id: string, formData: FormData) {
  const payload = await getPayload({ config: configPromise });

  const author = formData.get('author') as string;
  const location = formData.get('location') as string;
  const quote = formData.get('quote') as string;
  const rating = formData.get('rating') as string;
  const featured = formData.get('featured') === 'on';

  try {
    await payload.update({
      collection: 'testimonials',
      id,
      data: {
        author,
        location,
        quote,
        rating: parseFloat(rating) || 5,
        featured,
      } as any,
    });
  } catch (error) {
    console.error('Update Error:', error);
    return { error: 'Failed to update testimonial' };
  }

  revalidatePath('/dashboard/testimonials');
  redirect('/dashboard/testimonials');
}

export async function getTestimonialById(id: string) {
  const payload = await getPayload({ config: configPromise });
  try {
    const testimonial = await payload.findByID({
      collection: 'testimonials',
      id,
    });
    return testimonial;
  } catch (error) {
    return null;
  }
}

export async function getTestimonials() {
  const payload = await getPayload({ config: configPromise });
  
  const results = await payload.find({
    collection: 'testimonials',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
  });

  return results.docs;
}
