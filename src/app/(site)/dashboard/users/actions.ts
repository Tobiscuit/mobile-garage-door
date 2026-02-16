'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function inviteStaff(formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const role = String(formData.get('role') || 'technician');
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();

  try {
    const existing = await payload.find({
      collection: 'staff-invites' as any,
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'staff-invites' as any,
        id: existing.docs[0].id,
        data: {
          role,
          firstName: firstName || null,
          lastName: lastName || null,
          status: 'pending',
          acceptedAt: null,
        } as any,
      });
    } else {
      await payload.create({
        collection: 'staff-invites' as any,
        data: {
          email,
          role,
          firstName: firstName || null,
          lastName: lastName || null,
          status: 'pending',
        } as any,
      });
    }
  } catch (error) {
    console.error('Invite Error:', error);
    throw new Error('Failed to create staff invite');
  }

  revalidatePath('/dashboard/users');
  redirect('/dashboard/users');
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
