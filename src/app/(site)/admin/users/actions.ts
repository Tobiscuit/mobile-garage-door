'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUser(formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await payload.create({
      collection: 'users',
      data: {
        email,
        password,
      } as any,
    });
  } catch (error) {
    console.error('Create Error:', error);
    return { error: 'Failed to create user' };
  }

  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function getUsers() {
  const payload = await getPayload({ config: configPromise });
  
  const results = await payload.find({
    collection: 'users',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
  });

  return results.docs;
}
