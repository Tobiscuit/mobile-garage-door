import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { serviceRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';
import { validateStatusTransition } from '@/lib/tracking-validation';

/**
 * PATCH /api/tracking/status
 * Allows a tech to update their assigned service request status.
 * Enforces one-way state machine transitions:
 *   pending → confirmed → dispatched → on_site → completed
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

    if (!serviceRequestId || !status || typeof status !== 'string') {
      return NextResponse.json({ error: 'serviceRequestId and status are required' }, { status: 400 });
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

    // ── Enforce status transition rules ─────────────────────────────────
    const transition = validateStatusTransition(sr.status || 'pending', status);
    if (!transition.valid) {
      return NextResponse.json({ error: transition.error }, { status: 400 });
    }

    // Update status
    await db
      .update(serviceRequests)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(serviceRequests.id, serviceRequestId));

    // If completed, clean up D1 tracking data
    if (status === 'completed') {
      try {
        await (env as any).DB.prepare(
          'DELETE FROM tracking_latest WHERE service_request_id = ?'
        ).bind(serviceRequestId).run();
      } catch {}
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Status update error:', msg, error);
    return NextResponse.json({ error: 'Failed to update status', detail: msg }, { status: 500 });
  }
}
