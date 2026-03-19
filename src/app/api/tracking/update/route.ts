import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { users, serviceRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';
import { computeFuzzyLocation } from '@/lib/geo';
import { sendPushToUser, getMilestoneNotification } from '@/lib/push';
import { validateGpsInput } from '@/lib/tracking-validation';

/**
 * POST /api/tracking/update
 * Called by the tech's PWA every 30s with their GPS coordinates.
 * Computes fuzzy location → writes D1 (latest + audit) → fires push on milestone.
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

    // ── Validate GPS input ──────────────────────────────────────────────
    const validation = validateGpsInput(body);
    if (!validation.valid || !validation.sanitized) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { lat, lng, accuracy, serviceRequestId } = validation.sanitized;

    // Verify the tech is assigned to this service request
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

    if (!['dispatched', 'on_site'].includes(sr.status || '')) {
      return NextResponse.json({ error: 'Request not in trackable status' }, { status: 400 });
    }

    // Customer location — prefer stored geocoded coords, then Houston default
    const customerLat = (sr as any).customerLat || 29.7604;
    const customerLng = (sr as any).customerLng || -95.3698;

    // Compute fuzzy location
    const fuzzy = computeFuzzyLocation(lat, lng, customerLat, customerLng);

    // Write to D1 — latest state (replaces KV for fast reads)
    await (env as any).DB.prepare(
      `INSERT OR REPLACE INTO tracking_latest
       (service_request_id, center_lat, center_lng, radius, status, eta_minutes,
        tech_name, customer_lat, customer_lng, customer_id, last_update)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      serviceRequestId,
      fuzzy.center.lat,
      fuzzy.center.lng,
      fuzzy.radius,
      fuzzy.status,
      fuzzy.etaMinutes,
      session.user.name || 'Your technician',
      customerLat,
      customerLng,
      sr.customerId
    ).run();

    // Write to D1 — audit trail
    await (env as any).DB.prepare(
      `INSERT INTO tracking_events (service_request_id, tech_id, lat, lng, accuracy, fuzzy_radius, milestone, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      serviceRequestId,
      session.user.id,
      lat,
      lng,
      accuracy,
      fuzzy.radius,
      fuzzy.milestone
    ).run();

    // Check milestones and fire push notification to ALL customer devices
    if (fuzzy.milestone && sr.customerId) {
      // Check if this milestone has already been sent (dedup)
      const milestoneCheck = await (env as any).DB.prepare(
        `SELECT id FROM tracking_events
         WHERE service_request_id = ? AND milestone = ? AND id != last_insert_rowid()
         LIMIT 1`
      ).bind(serviceRequestId, fuzzy.milestone).first();

      if (!milestoneCheck) {
        // First time crossing this milestone — send push!
        const techName = session.user.name || 'Your technician';
        const locale = 'en'; // TODO: store user locale preference
        const notification = getMilestoneNotification(fuzzy.milestone, techName, locale);
        notification.data = {
          ...notification.data,
          ticketId: sr.ticketId,
          url: `/portal/track/${sr.ticketId}`,
        };

        await sendPushToUser(sr.customerId, notification, env as any);
      }
    }

    return NextResponse.json({
      success: true,
      fuzzy: {
        status: fuzzy.status,
        etaMinutes: fuzzy.etaMinutes,
        radius: fuzzy.radius,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Tracking update error:', msg, error);
    return NextResponse.json({ error: 'Failed to update tracking', detail: msg }, { status: 500 });
  }
}
