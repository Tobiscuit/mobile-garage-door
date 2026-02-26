'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
  const payload = await getPayload({ config: configPromise });
  
  const settings = await payload.findGlobal({
    slug: 'settings',
  });

  return settings;
}

export async function updateSettings(formData: FormData) {
  const payload = await getPayload({ config: configPromise });
  
  // Extract Company Info
  const companyName = formData.get('companyName') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const licenseNumber = formData.get('licenseNumber') as string;
  const insuranceAmount = formData.get('insuranceAmount') as string;
  const bbbRating = formData.get('bbbRating') as string;

  // Extract About Page Content
  const missionStatement = formData.get('missionStatement') as string;
  
  // Parse Stats Array
  const statsJson = formData.get('stats') as string;
  const stats = statsJson ? JSON.parse(statsJson) : [];

  // Parse Values Array
  const valuesJson = formData.get('values') as string;
  const values = valuesJson ? JSON.parse(valuesJson) : [];

  // Extract Brand Voice
  const brandVoice = formData.get('brandVoice') as string;
  const brandTone = formData.get('brandTone') as string;
  const brandAvoid = formData.get('brandAvoid') as string;

  // Extract Theme Preference
  const themePreference = formData.get('themePreference') as string;

  // Extract Warranty
  const warrantyEnableNotifications = formData.get('warrantyEnableNotifications') === 'true';
  const warrantyEmailTemplate = formData.get('warrantyEmailTemplate') as string;

  const warranty = {
      enableNotifications: warrantyEnableNotifications,
      notificationEmailTemplate: warrantyEmailTemplate,
  };

  try {
    await payload.updateGlobal({
      slug: 'settings',
      data: {
        companyName,
        phone,
        email,
        licenseNumber,
        insuranceAmount,
        bbbRating,
        missionStatement,
        stats,
        values,
        brandVoice,
        brandTone: brandTone as any,
        brandAvoid: brandAvoid as any,
        themePreference: themePreference as 'candlelight' | 'original',
        warranty: warranty as any,
      },
    });

    revalidatePath('/dashboard/settings');
    revalidatePath('/', 'layout'); // Revalidate entire site as settings might affect header/footer
    return { success: true };
  } catch (error) {
    console.error('Update Settings Error:', error);
    throw new Error('Failed to update settings');
  }
}
