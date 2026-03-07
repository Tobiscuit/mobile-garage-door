import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { users, serviceAddresses } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;
    const { getSessionSafe } = await import('@/lib/get-session-safe');
    const session = await getSessionSafe(request.headers);

    if (!session?.user?.email) {
      return NextResponse.json({ prefill: null });
    }

    // Get user profile
    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);
    const user = found[0];
    if (!user) {
      return NextResponse.json({ prefill: null });
    }

    // Get all saved addresses (up to 50) for client-side filtering
    const addresses = await db
      .select({ address: serviceAddresses.address, label: serviceAddresses.label })
      .from(serviceAddresses)
      .where(eq(serviceAddresses.userId, user.id))
      .orderBy(desc(serviceAddresses.lastUsedAt))
      .limit(50);

    return NextResponse.json({
      prefill: {
        name: user.name || session.user.name || '',
        email: user.email,
        phone: user.phone || '',
        lastAddress: addresses[0]?.address || '',
        isBuilder: user.customerType === 'builder',
      },
      recentAddresses: addresses,
    });
  } catch (error) {
    console.error('Prefill API error:', error);
    return NextResponse.json({ prefill: null, recentAddresses: [] });
  }
}
