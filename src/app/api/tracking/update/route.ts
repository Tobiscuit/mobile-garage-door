import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { users, serviceRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCloudflareContext } from '@/lib/cloudflare';
import { computeFuzzyLocation } from '@/lib/geo';
import { sendPushNotification, getMilestoneNotification } from '@/lib/push';
import { validateGpsInput, safeParseKvData } from '@/lib/tracking-validation';

/**
 * POST /api/tracking/update
 * Called by the tech's PWA every 30s with their GPS coordinates.
 * Computes fuzzy location → writes KV (latest) + D1 (audit) → fires push on milestone.
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

    // Get customer info for distance calculation and push
    const [customer] = sr.customerId
      ? await db.select().from(users).where(eq(users.id, sr.customerId)).limit(1)
      : [null];

    // Read existing KV state for customer coords
    const trackingKey = `tracking:${serviceRequestId}`;
    const existing = safeParseKvData<{ customerLat?: number; customerLng?: number }>(
      await (env as any).TRACKING_KV.get(trackingKey)
    );

    // Customer location — either from existing state or default
    const customerLat = existing?.customerLat || 29.7604; // Houston default
    const customerLng = existing?.customerLng || -95.3698;

    // Compute fuzzy location
    const fuzzy = computeFuzzyLocation(lat, lng, customerLat, customerLng);

    // Write to KV — latest state (fast reads for customer polling)
    const kvPayload = {
      center: fuzzy.center,
      radius: fuzzy.radius,
      status: fuzzy.status,
      etaMinutes: fuzzy.etaMinutes,
      techName: session.user.name || 'Your technician',
      lastUpdate: new Date().toISOString(),
      customerLat,
      customerLng,
      // Store the customer ID for ownership verification on reads
      customerId: sr.customerId,
    };
    await (env as any).TRACKING_KV.put(trackingKey, JSON.stringify(kvPayload), {
      expirationTtl: 7200, // Auto-expire after 2 hours
    });

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

    // Check milestones and fire push notification
    if (fuzzy.milestone && customer?.pushSubscription) {
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

        await sendPushNotification(customer.pushSubscription, notification, env as any);
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
    console.error('Tracking update error:', error);
    return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 });
  }
}
