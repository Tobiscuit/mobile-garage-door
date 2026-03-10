import { describe, it, expect } from 'vitest';
import { haversineDistance, computeFuzzyLocation } from './geo';

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    const d = haversineDistance(29.7604, -95.3698, 29.7604, -95.3698);
    expect(d).toBe(0);
  });

  it('calculates known distance: Houston to Dallas (~225 mi)', () => {
    const d = haversineDistance(29.7604, -95.3698, 32.7767, -96.7970);
    expect(d).toBeGreaterThan(220);
    expect(d).toBeLessThan(250);
  });

  it('calculates short distance: ~1 mile apart', () => {
    // 1° lat ≈ 69 miles, so 0.0145° ≈ 1 mile
    const d = haversineDistance(29.7604, -95.3698, 29.7749, -95.3698);
    expect(d).toBeGreaterThan(0.9);
    expect(d).toBeLessThan(1.1);
  });

  it('handles negative latitudes (southern hemisphere)', () => {
    const d = haversineDistance(-33.8688, 151.2093, -33.8588, 151.2093);
    expect(d).toBeGreaterThan(0);
  });

  it('handles antimeridian crossing', () => {
    const d = haversineDistance(0, 179.9, 0, -179.9);
    // Should be ~13.8 miles (not 24,855 miles going "the wrong way")
    expect(d).toBeLessThan(20);
  });
});

describe('computeFuzzyLocation', () => {
  // Houston coordinates as the customer
  const custLat = 29.7604;
  const custLng = -95.3698;

  it('returns "on_the_way" for tech > 5 miles away', () => {
    // ~10 miles north
    const fuzzy = computeFuzzyLocation(29.905, -95.370, custLat, custLng);
    expect(fuzzy.status).toBe('on_the_way');
    expect(fuzzy.radius).toBe(5);
    expect(fuzzy.milestone).toBeNull();
  });

  it('returns "getting_close" + eta_15 milestone for 2-5 miles', () => {
    // ~3 miles away
    const fuzzy = computeFuzzyLocation(29.804, -95.370, custLat, custLng);
    expect(fuzzy.status).toBe('getting_close');
    expect(fuzzy.radius).toBe(2);
    expect(fuzzy.milestone).toBe('eta_15');
  });

  it('returns "almost_there" for 0.5-2 miles', () => {
    // ~1 mile away
    const fuzzy = computeFuzzyLocation(29.775, -95.370, custLat, custLng);
    expect(fuzzy.status).toBe('almost_there');
    expect(fuzzy.radius).toBe(0.5);
    expect(fuzzy.milestone).toBeNull();
  });

  it('returns "arriving" + eta_3 milestone for < 0.5 miles', () => {
    // ~0.2 miles away
    const fuzzy = computeFuzzyLocation(29.763, -95.370, custLat, custLng);
    expect(fuzzy.status).toBe('arriving');
    expect(fuzzy.radius).toBe(0.1);
    expect(fuzzy.milestone).toBe('eta_3');
  });

  it('snaps coordinates to coarse grid for privacy (> 0.5 mi)', () => {
    const fuzzy = computeFuzzyLocation(29.76345, -95.36987, custLat, custLng);
    // Should snap to 0.01° grid
    const latStr = fuzzy.center.lat.toString();
    const lngStr = fuzzy.center.lng.toString();
    // Snapped to 0.01° grid — but floating point may add trailing digits
    // The key assertion is that precision is reduced vs raw input
    const rawPrecision = '29.76345'.split('.')[1]!.length; // 5
    const snappedPrecision = latStr.split('.')[1]?.length || 0;
    expect(snappedPrecision).toBeLessThan(rawPrecision);
    const snappedLngPrecision = lngStr.split('.')[1]?.length || 0;
    expect(snappedLngPrecision).toBeLessThan('95.36987'.split('.')[1]!.length);
  });

  it('snaps coordinates to fine grid for < 0.5 mi', () => {
    const fuzzy = computeFuzzyLocation(29.7607, -95.3701, custLat, custLng);
    expect(fuzzy.status).toBe('arriving');
    // Fine grid: 0.001° precision
    const latStr = fuzzy.center.lat.toString();
    expect(latStr.split('.')[1]?.length || 0).toBeLessThanOrEqual(3);
  });

  it('ETA is at least 1 minute even at very close distance', () => {
    const fuzzy = computeFuzzyLocation(custLat, custLng, custLat, custLng);
    expect(fuzzy.etaMinutes).toBeGreaterThanOrEqual(1);
  });

  it('ETA is reasonable for 30mph estimate', () => {
    // 15 miles away → ~30 min at 30mph
    const fuzzy = computeFuzzyLocation(29.978, -95.370, custLat, custLng);
    expect(fuzzy.etaMinutes).toBeGreaterThan(20);
    expect(fuzzy.etaMinutes).toBeLessThan(40);
  });
});
