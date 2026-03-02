'use server';

import { getDB } from '@/db';
import { services } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCloudflareContext } from 'vinext/cloudflare';
import { revalidatePath } from 'next/cache';
import { redirect } from 'vinext/navigation';

export async function createService(formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const price = formData.get('price') as string;

  try {
    await db.insert(services).values({
      title,
      description,
      category,
      price: parseFloat(price) || 0,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Failed to create service' };
  }

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services');
}

export async function updateService(id: string, formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const price = formData.get('price') as string;

  try {
    await db.update(services).set({
      title,
      description,
      category,
      price: parseFloat(price) || 0,
      updatedAt: new Date().toISOString(),
    }).where(eq(services.id, parseInt(id, 10)));
  } catch (error) {
    console.error('Update Error:', error);
    return { error: 'Failed to update service' };
  }

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services');
}

export async function getServiceById(id: string) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  try {
    const result = await db.select().from(services).where(eq(services.id, parseInt(id, 10))).limit(1);
    return result[0] || null;
  } catch (error) {
    return null;
  }
}

export async function getServices() {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  return db.select().from(services).orderBy(services.order);
}
