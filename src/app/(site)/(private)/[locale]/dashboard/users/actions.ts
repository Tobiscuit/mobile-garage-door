'use server';

import { getDB } from "@/db";
import { users, staffInvites } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCloudflareContext } from "@/lib/cloudflare";

export async function inviteStaff(formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const role = String(formData.get('role') || 'technician') as "technician" | "admin";
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();

  try {
    const existing = await db.select().from(staffInvites).where(eq(staffInvites.email, email)).limit(1);

    if (existing.length > 0) {
      await db.update(staffInvites).set({
          role,
          firstName: firstName || null,
          lastName: lastName || null,
          status: 'pending',
          acceptedAt: null,
          updatedAt: new Date().toISOString()
      }).where(eq(staffInvites.id, existing[0].id));
    } else {
      await db.insert(staffInvites).values({
          email,
          role,
          firstName: firstName || null,
          lastName: lastName || null,
          status: 'pending',
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
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
}

export async function getUserById(id: string) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error('Failed to get user by id:', error);
    return null;
  }
}

export async function updateUser(id: string, data: Partial<typeof users.$inferInsert>) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  try {
    const updatedUsers = await db.update(users)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(users.id, id))
        .returning();

    revalidatePath(`/dashboard/users/\${id}`);
    revalidatePath('/dashboard/users');
    return { success: true, user: updatedUsers[0] };
  } catch (error) {
    console.error('Failed to update user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}
