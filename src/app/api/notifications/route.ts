import { getCloudflareContext } from '@/lib/cloudflare';
import { getDB } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSessionSafe } from '@/lib/get-session-safe';
import { headers } from 'next/headers';

/**
 * GET /api/notifications
 * Returns the current user's notification feed (newest first, max 50).
 */
export async function GET() {
  const headersList = await headers();
  const session = await getSessionSafe(headersList);
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { env } = await getCloudflareContext();
  const db = getDB(env.DB)!;

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return Response.json({ notifications: items });
}

/**
 * PATCH /api/notifications
 * Mark notifications as read.
 * Body: { ids: number[] } or { all: true }
 */
export async function PATCH(request: Request) {
  const headersList = await headers();
  const session = await getSessionSafe(headersList);
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { env } = await getCloudflareContext();
  const db = getDB(env.DB)!;

  let body: { ids?: number[]; all?: boolean };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.all) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.userId, session.user.id),
        eq(notifications.read, false)
      ));
  } else if (body.ids?.length) {
    // Mark specific notifications as read
    for (const id of body.ids) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(and(
          eq(notifications.id, id),
          eq(notifications.userId, session.user.id)
        ));
    }
  }

  return Response.json({ success: true });
}
