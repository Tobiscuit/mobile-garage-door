import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { serviceRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';
import { safeParseKvData } from '@/lib/tracking-validation';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

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

    // ── Rate limit ────────────────────────────────────────────────────
    const rl = await checkRateLimit(
      (env as any).TRACKING_KV,
      `ratelimit:latest:${session.user.id}`,
      RATE_LIMITS.trackingLatest.maxRequests,
      RATE_LIMITS.trackingLatest.windowSeconds
    );
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rl.retryAfterSeconds },
        { status: 429 }
      );
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

    // Read latest fuzzy location from KV
    const trackingKey = `tracking:${parsedId}`;
    const data = safeParseKvData<{
      center: { lat: number; lng: number };
      radius: number;
      status: string;
      etaMinutes: number;
      techName: string;
      lastUpdate: string;
    }>(await (env as any).TRACKING_KV.get(trackingKey));

    if (!data) {
      return NextResponse.json({
        tracking: null,
        message: 'No active tracking for this request',
      });
    }

    // Calculate staleness
    const lastUpdate = new Date(data.lastUpdate);
    const now = new Date();
    const staleMinutes = Math.round((now.getTime() - lastUpdate.getTime()) / 60000);

    return NextResponse.json({
      tracking: {
        center: data.center,
        radius: data.radius,
        status: data.status,
        etaMinutes: data.etaMinutes,
        techName: data.techName,
        lastUpdate: data.lastUpdate,
        staleMinutes,
        isStale: staleMinutes > 5,
      },
    });
  } catch (error) {
    console.error('Tracking latest error:', error);
    return NextResponse.json({ error: 'Failed to get tracking data' }, { status: 500 });
  }
}
