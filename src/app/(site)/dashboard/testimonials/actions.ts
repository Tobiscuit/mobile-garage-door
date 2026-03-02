'use server';

import { getDB } from '@/db';
import { testimonials } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCloudflareContext } from 'vinext/cloudflare';
import { revalidatePath } from 'next/cache';
import { redirect } from 'vinext/navigation';

export async function createTestimonial(formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const author = formData.get('author') as string;
  const location = formData.get('location') as string;
  const quote = formData.get('quote') as string;
  const rating = formData.get('rating') as string;
  const featured = formData.get('featured') === 'on';

  try {
    await db.insert(testimonials).values({
      author,
      location,
      quote,
      rating: parseInt(rating, 10) || 5,
      featured,
    });
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Failed to create testimonial' };
  }

  revalidatePath('/dashboard/testimonials');
  redirect('/dashboard/testimonials');
}

export async function updateTestimonial(id: string, formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const author = formData.get('author') as string;
  const location = formData.get('location') as string;
  const quote = formData.get('quote') as string;
  const rating = formData.get('rating') as string;
  const featured = formData.get('featured') === 'on';

  try {
    await db.update(testimonials).set({
      author,
      location,
      quote,
      rating: parseInt(rating, 10) || 5,
      featured,
      updatedAt: new Date().toISOString(),
    }).where(eq(testimonials.id, parseInt(id, 10)));
  } catch (error) {
    console.error('Update Error:', error);
    return { error: 'Failed to update testimonial' };
  }

  revalidatePath('/dashboard/testimonials');
  redirect('/dashboard/testimonials');
}

export async function getTestimonialById(id: string) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  try {
    const result = await db.select().from(testimonials).where(eq(testimonials.id, parseInt(id, 10))).limit(1);
    return result[0] || null;
  } catch (error) {
    return null;
  }
}

export async function getTestimonials() {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  return db.select().from(testimonials);
}
