import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { serviceAddresses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;
    const { getSessionSafe } = await import('@/lib/get-session-safe');
    const session = await getSessionSafe(request.headers);

    if (!session?.user?.id) {
      return NextResponse.json({ saved: false });
    }

    const body = await request.json();
    const address = body.address?.trim();
    if (!address) {
      return NextResponse.json({ saved: false });
    }

    const userId = session.user.id;

    // Check if this address already exists for this user
    const existing = await db
      .select()
      .from(serviceAddresses)
      .where(eq(serviceAddresses.userId, userId))
      .limit(50);

    const match = existing.find(
      (r) => r.address.toLowerCase() === address.toLowerCase()
    );

    if (match) {
      // Bump count and timestamp
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
        address,
        lastUsedAt: new Date(),
        useCount: 1,
      });
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Save address error:', error);
    return NextResponse.json({ saved: false });
  }
}
