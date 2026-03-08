import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';

/**
 * POST /api/push/subscribe
 * Saves or updates a Web Push subscription for the authenticated user.
 * Body: { subscription: PushSubscriptionJSON }
 */
export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;
    const { getSessionSafe } = await import('@/lib/get-session-safe');
    const session = await getSessionSafe(request.headers);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Store the full PushSubscription JSON in the user record
    await db
      .update(users)
      .set({
        pushSubscription: JSON.stringify(subscription),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

/**
 * DELETE /api/push/subscribe
 * Removes the push subscription for the authenticated user.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;
    const { getSessionSafe } = await import('@/lib/get-session-safe');
    const session = await getSessionSafe(request.headers);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .update(users)
      .set({
        pushSubscription: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
