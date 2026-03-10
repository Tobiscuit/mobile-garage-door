/**
 * Tracking validation utilities — framework-agnostic, pure functions.
 * Used by tracking API routes. Will survive Hono migration since there's
 * zero coupling to Next.js or Vinext.
 */

// ─── GPS Coordinate Validation ───────────────────────────────────────────────

export interface GpsInput {
  lat: number;
  lng: number;
  accuracy?: number;
  serviceRequestId: number | string;
}

export interface GpsValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    lat: number;
    lng: number;
    accuracy: number | null;
    serviceRequestId: number;
  };
}

/**
 * Validate and sanitize GPS input from the tech's device.
 * Pure function — no side effects, no framework dependency.
 */
export function validateGpsInput(body: unknown): GpsValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { lat, lng, accuracy, serviceRequestId } = body as Record<string, unknown>;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'lat and lng must be numbers' };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'lat must be between -90 and 90' };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'lng must be between -180 and 180' };
  }

  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'lat/lng cannot be NaN' };
  }

  if (!serviceRequestId) {
    return { valid: false, error: 'serviceRequestId is required' };
  }

  const parsedId = typeof serviceRequestId === 'string'
    ? parseInt(serviceRequestId, 10)
    : serviceRequestId;

  if (typeof parsedId !== 'number' || isNaN(parsedId) || parsedId <= 0) {
    return { valid: false, error: 'serviceRequestId must be a positive number' };
  }

  const sanitizedAccuracy = typeof accuracy === 'number' && accuracy > 0 && accuracy < 100000
    ? accuracy
    : null;

  return {
    valid: true,
    sanitized: {
      lat: Math.round(lat * 1_000_000) / 1_000_000, // 6 decimal places max
      lng: Math.round(lng * 1_000_000) / 1_000_000,
      accuracy: sanitizedAccuracy,
      serviceRequestId: parsedId,
    },
  };
}

// ─── Status Transition Guards ────────────────────────────────────────────────

/**
 * Valid status transitions for service requests.
 * Only forward progression is allowed (no going backwards).
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'dispatched'],
  confirmed: ['dispatched'],
  dispatched: ['on_site'],
  on_site: ['completed'],
  completed: [],
  cancelled: [],
};

export interface TransitionResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that a status transition is allowed.
 * Pure function — enforce one-way state machine.
 */
export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): TransitionResult {
  const allowed = VALID_TRANSITIONS[currentStatus];

  if (!allowed) {
    return { valid: false, error: `Unknown current status: ${currentStatus}` };
  }

  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowed.join(', ') || 'none'}`,
    };
  }

  return { valid: true };
}

// ─── Safe KV JSON Parsing ────────────────────────────────────────────────────

/**
 * Safely parse KV JSON data — handles corruption gracefully.
 * Returns null on any parse error instead of throwing.
 */
export function safeParseKvData<T = Record<string, unknown>>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as T;
  } catch {
    console.error('[Tracking] Corrupt KV data, returning null');
    return null;
  }
}
