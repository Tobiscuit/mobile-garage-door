import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { serviceRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';

/**
 * GET /api/tracking/latest/[requestId]
 * Returns the latest fuzzy location for a service request.
 * Called by the customer's portal, polling every 10s.
 * 
 * SECURITY: Verifies the requesting user is the actual customer
 * for this service request (ownership check).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { env } = await getCloudflareContext();
    const { getSessionSafe } = await import('@/lib/get-session-safe');
    const session = await getSessionSafe(request.headers);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId } = await params;
    const parsedId = parseInt(requestId, 10);

    if (isNaN(parsedId) || parsedId <= 0) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    // ── Ownership check — verify the user is the customer OR the assigned tech ──
    const db = getDB(env.DB)!;
    const [sr] = await db
      .select({
        id: serviceRequests.id,
        customerId: serviceRequests.customerId,
        assignedTechId: serviceRequests.assignedTechId,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, parsedId))
      .limit(1);

    if (!sr) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    // Allow access to: the customer, the assigned tech, or admin/dispatcher
    const userId = session.user.id;
    const userRole = (session.user as any).role;
    const isCustomer = sr.customerId === userId;
    const isTech = sr.assignedTechId === userId;
    const isStaff = ['admin', 'dispatcher'].includes(userRole || '');

    if (!isCustomer && !isTech && !isStaff) {
      return NextResponse.json({ error: 'Not authorized to view this tracking data' }, { status: 403 });
    }

    // Read latest tracking state from D1
    const data = await (env as any).DB.prepare(
      `SELECT center_lat, center_lng, radius, status, eta_minutes,
              tech_name, last_update
       FROM tracking_latest
       WHERE service_request_id = ?`
    ).bind(parsedId).first();

    if (!data) {
      return NextResponse.json({
        tracking: null,
        message: 'No active tracking for this request',
      });
    }

    // Calculate staleness
    const lastUpdate = new Date(data.last_update + 'Z'); // D1 datetime is UTC without Z
    const now = new Date();
    const staleMinutes = Math.round((now.getTime() - lastUpdate.getTime()) / 60000);

    return NextResponse.json({
      tracking: {
        center: { lat: data.center_lat, lng: data.center_lng },
        radius: data.radius,
        status: data.status,
        etaMinutes: data.eta_minutes,
        techName: data.tech_name,
        lastUpdate: data.last_update,
        staleMinutes,
        isStale: staleMinutes > 5,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Tracking latest error:', msg, error);
    return NextResponse.json({ error: 'Failed to get tracking data', detail: msg }, { status: 500 });
  }
}
