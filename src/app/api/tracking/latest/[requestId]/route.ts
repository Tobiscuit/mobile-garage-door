import { type NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/cloudflare';

/**
 * GET /api/tracking/latest/[requestId]
 * Returns the latest fuzzy location for a service request.
 * Called by the customer's portal, polling every 10s.
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

    // Read latest fuzzy location from KV
    const trackingKey = `tracking:${requestId}`;
    const raw = await (env as any).TRACKING_KV.get(trackingKey);

    if (!raw) {
      return NextResponse.json({
        tracking: null,
        message: 'No active tracking for this request',
      });
    }

    const data = JSON.parse(raw);

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
