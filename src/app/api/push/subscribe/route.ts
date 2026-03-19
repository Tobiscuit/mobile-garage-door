import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';

/**
 * POST /api/push/subscribe
 * Saves or updates a Web Push subscription for the authenticated user.
 * Supports multiple devices per user via the push_subscriptions table.
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

    const userAgent = request.headers.get('user-agent') || undefined;

    // Upsert: if this endpoint already exists, update it; otherwise insert
    const existing = await db.select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1);

    if (existing.length > 0) {
      await db.update(pushSubscriptions)
        .set({
          subscription: JSON.stringify(subscription),
          userId: session.user.id,
          userAgent,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(pushSubscriptions.id, existing[0].id));
    } else {
      await db.insert(pushSubscriptions).values({
        userId: session.user.id,
        endpoint: subscription.endpoint,
        subscription: JSON.stringify(subscription),
        userAgent,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

/**
 * DELETE /api/push/subscribe
 * Removes the push subscription for the current device.
 * Body: { endpoint?: string } — if provided, removes specific device; otherwise removes all.
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

    let endpoint: string | undefined;
    try {
      const body = await request.json();
      endpoint = body?.endpoint;
    } catch {
      // No body — remove all
    }

    if (endpoint) {
      // Remove specific device
      await db.delete(pushSubscriptions)
        .where(and(
          eq(pushSubscriptions.userId, session.user.id),
          eq(pushSubscriptions.endpoint, endpoint),
        ));
    } else {
      // Remove all subscriptions for this user
      await db.delete(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, session.user.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
