'use server';

import { headers } from 'next/headers';
import { getDB } from '@/db';
import { serviceAddresses, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSessionSafe } from '@/lib/get-session-safe';
import { getCloudflareContext } from '@/lib/cloudflare';

/**
 * Fetch all service addresses for the current logged-in user.
 * Returns them sorted by lastUsedAt desc (most recent first).
 * All addresses are sent to the client for local fuzzy filtering.
 */
export async function getServiceAddresses(): Promise<{ address: string; label: string | null }[]> {
  try {
    let headerList = new Headers();
    try { headerList = await headers(); } catch {}
    const session = await getSessionSafe(headerList);
    if (!session?.user?.id) return [];

    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;

    const rows = await db
      .select({ address: serviceAddresses.address, label: serviceAddresses.label })
      .from(serviceAddresses)
      .where(eq(serviceAddresses.userId, session.user.id))
      .orderBy(desc(serviceAddresses.lastUsedAt))
      .limit(50); // Send all (up to 50) for client-side filtering

    return rows;
  } catch (e) {
    console.error('Failed to fetch service addresses:', e);
    return [];
  }
}

/**
 * Save or update a service address after form submission.
 * If the address already exists for this user, bumps useCount and lastUsedAt.
 * Otherwise creates a new record.
 */
export async function saveServiceAddress(address: string): Promise<void> {
  try {
    let headerList = new Headers();
    try { headerList = await headers(); } catch {}
    const session = await getSessionSafe(headerList);
    if (!session?.user?.id || !address.trim()) return;

    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;
    const userId = session.user.id;
    const normalizedAddress = address.trim();

    // Check if this address already exists for this user
    const existing = await db
      .select()
      .from(serviceAddresses)
      .where(eq(serviceAddresses.userId, userId))
      .limit(50);

    const match = existing.find(
      r => r.address.toLowerCase() === normalizedAddress.toLowerCase()
    );

    if (match) {
      // Update existing — bump count and timestamp
      await db
        .update(serviceAddresses)
        .set({
          lastUsedAt: new Date(),
          useCount: (match.useCount || 1) + 1,
        })
        .where(eq(serviceAddresses.id, match.id));
    } else {
      // Insert new
      await db.insert(serviceAddresses).values({
        id: crypto.randomUUID(),
        userId,
        address: normalizedAddress,
        lastUsedAt: new Date(),
        useCount: 1,
      });
    }
  } catch (e) {
    console.error('Failed to save service address:', e);
  }
}

/**
 * Get logged-in user profile data for form prefill.
 */
export async function getProfileForPrefill(): Promise<{
  name: string;
  email: string;
  phone: string;
  lastAddress: string;
  isBuilder: boolean;
} | null> {
  try {
    let headerList = new Headers();
    try { headerList = await headers(); } catch {}
    const session = await getSessionSafe(headerList);
    if (!session?.user?.email) return null;

    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;

    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);
    const user = found[0];
    if (!user) return null;

    // Get most recent address
    const recentAddr = await db
      .select({ address: serviceAddresses.address })
      .from(serviceAddresses)
      .where(eq(serviceAddresses.userId, user.id))
      .orderBy(desc(serviceAddresses.lastUsedAt))
      .limit(1);

    return {
      name: user.name || session.user.name || '',
      email: user.email,
      phone: user.phone || '',
      lastAddress: recentAddr[0]?.address || '',
      isBuilder: user.customerType === 'builder',
    };
  } catch (e) {
    console.error('Failed to get profile for prefill:', e);
    return null;
  }
}
