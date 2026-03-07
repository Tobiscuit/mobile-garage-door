'use server';

import { getDB } from "@/db";
import { users, staffInvites } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCloudflareContext } from "@/lib/cloudflare";
import { sendEmail } from "@/lib/email";

export async function inviteStaff(formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const role = String(formData.get('role') || 'technician') as "technician" | "admin";
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();

  // Generate secure token + 48h expiry
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  try {
    const existing = await db.select().from(staffInvites).where(eq(staffInvites.email, email)).limit(1);

    if (existing.length > 0) {
      await db.update(staffInvites).set({
          role,
          firstName: firstName || null,
          lastName: lastName || null,
          token,
          expiresAt,
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
          token,
          expiresAt,
          status: 'pending',
      });
    }

    // Send branded invite email via Resend
    const roleLabel = role === 'admin' ? 'Admin' : 'Technician';
    const displayName = firstName ? `Hi ${firstName},` : 'Hi there,';
    const loginUrl = 'https://mobilgaragedoor.com/en/login';

    await sendEmail({
      to: email,
      subject: `You're invited to Mobil Garage Door`,
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:'Work Sans',Helvetica,Arial,sans-serif;background:#f7f9fb;padding:40px 24px;">
          <div style="background:#2c3e50;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(44,62,80,0.15);">
            <div style="padding:32px 32px 24px;text-align:center;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 4px;">Mobil Garage Door</h1>
              <p style="color:#7f8c8d;font-size:13px;margin:0;">Staff Invitation</p>
            </div>
            <div style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;">
              <p style="color:#2c3e50;font-size:16px;margin:0 0 8px;line-height:1.5;">${displayName}</p>
              <p style="color:#2c3e50;font-size:16px;margin:0 0 24px;line-height:1.5;">
                You've been invited to join the team as <strong style="color:#f1c40f;background:#2c3e50;padding:2px 8px;border-radius:6px;font-size:12px;letter-spacing:0.5px;text-transform:uppercase;">${roleLabel}</strong>.
              </p>
              <a href="${loginUrl}" style="display:block;background:#f1c40f;color:#2c3e50;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:12px;text-align:center;">
                Accept Invitation →
              </a>
              <p style="color:#7f8c8d;font-size:12px;margin:24px 0 0;text-align:center;">This invite expires in 48 hours. If you didn't expect this, you can safely ignore it.</p>
            </div>
          </div>
        </div>
      `.trim(),
      text: `You've been invited to join Mobil Garage Door as a ${roleLabel}.\n\nClick the link below to accept:\n${loginUrl}\n\nThis invite expires in 48 hours.`,
    });

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
