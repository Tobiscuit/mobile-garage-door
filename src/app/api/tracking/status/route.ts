import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { serviceRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';

/**
 * PATCH /api/tracking/status
 * Allows a tech to update their assigned service request status.
 * Used for "I'm heading out" (→ dispatched) and "Job complete" (→ completed).
 */
export async function PATCH(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;
    const { getSessionSafe } = await import('@/lib/get-session-safe');
    const session = await getSessionSafe(request.headers);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceRequestId, status } = body;

    // Only allow specific transitions
    const allowedStatuses = ['dispatched', 'on_site', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify the tech is assigned to this request
    const [sr] = await db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.id, serviceRequestId),
          eq(serviceRequests.assignedTechId, session.user.id)
        )
      )
      .limit(1);

    if (!sr) {
      return NextResponse.json({ error: 'Not assigned to this request' }, { status: 403 });
    }

    // Update status
    await db
      .update(serviceRequests)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(serviceRequests.id, serviceRequestId));

    // If completed, clean up KV tracking data
    if (status === 'completed') {
      try {
        await (env as any).TRACKING_KV.delete(`tracking:${serviceRequestId}`);
      } catch {}
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
