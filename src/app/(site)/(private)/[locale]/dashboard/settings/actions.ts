'use server';

import { getDB } from "@/db";
import { settings, settingStats, settingValues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { getCloudflareContext } from "@/lib/cloudflare";

export async function getSettings() {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  return db.query.settings.findFirst({
    with: {
        stats: true,
        values: true
    }
  });
}

export async function updateSettings(formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  
  const companyName = formData.get('companyName') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const licenseNumber = formData.get('licenseNumber') as string;
  const insuranceAmount = formData.get('insuranceAmount') as string;
  const bbbRating = formData.get('bbbRating') as string;
  const missionStatement = formData.get('missionStatement') as string;
  
  const statsJson = formData.get('stats') as string;
  const statsList = statsJson ? JSON.parse(statsJson) : [];

  const valuesJson = formData.get('values') as string;
  const valuesList = valuesJson ? JSON.parse(valuesJson) : [];

  const brandVoice = formData.get('brandVoice') as string;
  const brandTone = formData.get('brandTone') as string;
  const brandAvoid = formData.get('brandAvoid') as string;
  const themePreference = formData.get('themePreference') as string;
  const warrantyEnableNotifications = formData.get('warrantyEnableNotifications') === 'true';
  const warrantyEmailTemplate = formData.get('warrantyEmailTemplate') as string;

  try {
    const existing = await db.query.settings.findFirst();

    let settingId: number;
    if (existing) {
        settingId = existing.id;
        await db.update(settings).set({
            companyName, phone, email, licenseNumber, insuranceAmount, bbbRating,
            missionStatement, brandVoice, brandTone, brandAvoid,
            themePreference: themePreference as "candlelight" | "original",
            warrantyEnableNotifications,
            warrantyNotificationEmailTemplate: warrantyEmailTemplate,
            updatedAt: new Date().toISOString()
        }).where(eq(settings.id, settingId));
    } else {
        const newSettings = await db.insert(settings).values({
            companyName, phone, email, licenseNumber, insuranceAmount, bbbRating,
            missionStatement, brandVoice, brandTone, brandAvoid,
            themePreference: themePreference as "candlelight" | "original",
            warrantyEnableNotifications,
            warrantyNotificationEmailTemplate: warrantyEmailTemplate,
        }).returning();
        settingId = newSettings[0].id;
    }

    await db.delete(settingStats).where(eq(settingStats.settingId, settingId));
    if (statsList.length > 0) {
        await db.insert(settingStats).values(
            statsList.map((s: any) => ({ settingId, label: s.label, value: s.value }))
        );
    }

    await db.delete(settingValues).where(eq(settingValues.settingId, settingId));
    if (valuesList.length > 0) {
        await db.insert(settingValues).values(
            valuesList.map((v: any) => ({ settingId, title: v.title, description: v.description }))
        );
    }

    revalidatePath('/dashboard/settings');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Update Settings Error:', error);
    throw new Error('Failed to update settings');
  }
}
