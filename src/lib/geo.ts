/**
 * Geolocation utilities for tech arrival tracking.
 * Haversine distance, fuzzy radius mapping, and ETA estimation.
 */

/**
 * Calculate the Haversine distance between two coordinates in miles.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

interface FuzzyLocation {
  /** Center of the fuzzy circle (snapped to ~0.01° grid, not raw GPS) */
  center: { lat: number; lng: number };
  /** Radius in miles */
  radius: number;
  /** Human-readable status */
  status: 'on_the_way' | 'getting_close' | 'almost_there' | 'arriving';
  /** Estimated minutes */
  etaMinutes: number;
  /** Milestone that was just crossed, if any */
  milestone: 'eta_15' | 'eta_3' | null;
}

/**
 * Progressive location disclosure — maps raw distance to fuzzy circle.
 * Raw GPS never leaves this function.
 */
export function computeFuzzyLocation(
  techLat: number,
  techLng: number,
  customerLat: number,
  customerLng: number
): FuzzyLocation {
  const distanceMiles = haversineDistance(techLat, techLng, customerLat, customerLng);

  // Estimate ETA: ~30mph average urban driving
  const etaMinutes = Math.round((distanceMiles / 30) * 60);

  let radius: number;
  let status: FuzzyLocation['status'];
  let milestone: FuzzyLocation['milestone'] = null;

  if (distanceMiles > 5) {
    radius = 5;
    status = 'on_the_way';
  } else if (distanceMiles > 2) {
    radius = 2;
    status = 'getting_close';
    milestone = 'eta_15';
  } else if (distanceMiles > 0.5) {
    radius = 0.5;
    status = 'almost_there';
  } else {
    radius = 0.1; // ~500 ft
    status = 'arriving';
    milestone = 'eta_3';
  }

  // Snap center to ~0.01° grid (~0.7 mile precision) for privacy
  // When close (< 0.5 mi), use finer grid (~0.001° = 350 ft)
  const gridSize = distanceMiles < 0.5 ? 0.001 : 0.01;
  const snappedLat = Math.round(techLat / gridSize) * gridSize;
  const snappedLng = Math.round(techLng / gridSize) * gridSize;

  return {
    center: { lat: snappedLat, lng: snappedLng },
    radius,
    status,
    etaMinutes: Math.max(1, etaMinutes),
    milestone,
  };
}
