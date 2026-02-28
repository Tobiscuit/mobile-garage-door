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

export async function getUserById(id: string | number) {
  const payload = await getPayload({ config: configPromise });
  
  try {
    const user = await payload.findByID({
      collection: 'users',
      id: typeof id === 'string' ? parseInt(id, 10) : id,
      depth: 1,
    });
    return user;
  } catch (error) {
    console.error('Failed to get user by id:', error);
    return null;
  }
}
export async function updateUser(id: string | number, data: any) {
  const payload = await getPayload({ config: configPromise });
  
  try {
    const updatedUser = await payload.update({
      collection: 'users',
      id: typeof id === 'string' ? parseInt(id, 10) : id,
      data,
    });
    revalidatePath(`/dashboard/users/${id}`);
    revalidatePath('/dashboard/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Failed to update user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

