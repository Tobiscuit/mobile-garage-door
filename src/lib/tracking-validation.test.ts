import { describe, it, expect } from 'vitest';
import {
  validateGpsInput,
  validateStatusTransition,
  safeParseKvData,
} from './tracking-validation';

// ─── validateGpsInput ────────────────────────────────────────────────────────

describe('validateGpsInput', () => {
  it('accepts valid GPS coordinates', () => {
    const result = validateGpsInput({ lat: 29.7604, lng: -95.3698, serviceRequestId: 42 });
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBeDefined();
    expect(result.sanitized!.lat).toBe(29.7604);
    expect(result.sanitized!.lng).toBe(-95.3698);
    expect(result.sanitized!.serviceRequestId).toBe(42);
  });

  it('rejects lat out of bounds (> 90)', () => {
    const result = validateGpsInput({ lat: 91, lng: -95, serviceRequestId: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/lat must be between/);
  });

  it('rejects lat out of bounds (< -90)', () => {
    const result = validateGpsInput({ lat: -91, lng: -95, serviceRequestId: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/lat must be between/);
  });

  it('rejects lng out of bounds (> 180)', () => {
    const result = validateGpsInput({ lat: 29, lng: 181, serviceRequestId: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/lng must be between/);
  });

  it('rejects lng out of bounds (< -180)', () => {
    const result = validateGpsInput({ lat: 29, lng: -181, serviceRequestId: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/lng must be between/);
  });

  it('rejects NaN coordinates', () => {
    const result = validateGpsInput({ lat: NaN, lng: -95, serviceRequestId: 1 });
    expect(result.valid).toBe(false);
  });

  it('rejects non-number coordinates', () => {
    const result = validateGpsInput({ lat: '29.76', lng: '-95.37', serviceRequestId: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/must be numbers/);
  });

  it('rejects missing serviceRequestId', () => {
    const result = validateGpsInput({ lat: 29.76, lng: -95.37 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/serviceRequestId/);
  });

  it('rejects negative serviceRequestId', () => {
    const result = validateGpsInput({ lat: 29.76, lng: -95.37, serviceRequestId: -1 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/positive number/);
  });

  it('rejects null body', () => {
    const result = validateGpsInput(null);
    expect(result.valid).toBe(false);
  });

  it('rejects string body', () => {
    const result = validateGpsInput('not an object');
    expect(result.valid).toBe(false);
  });

  it('sanitizes coordinates to 6 decimal places', () => {
    const result = validateGpsInput({
      lat: 29.76041234567890,
      lng: -95.36981234567890,
      serviceRequestId: 1,
    });
    expect(result.valid).toBe(true);
    expect(result.sanitized!.lat).toBe(29.760412);
    expect(result.sanitized!.lng).toBe(-95.369812);
  });

  it('sanitizes accuracy — accepts normal values', () => {
    const result = validateGpsInput({ lat: 29.76, lng: -95.37, accuracy: 15, serviceRequestId: 1 });
    expect(result.sanitized!.accuracy).toBe(15);
  });

  it('sanitizes accuracy — rejects insane values', () => {
    const result = validateGpsInput({ lat: 29.76, lng: -95.37, accuracy: 999999, serviceRequestId: 1 });
    expect(result.sanitized!.accuracy).toBeNull();
  });

  it('parses string serviceRequestId', () => {
    const result = validateGpsInput({ lat: 29.76, lng: -95.37, serviceRequestId: '42' });
    expect(result.valid).toBe(true);
    expect(result.sanitized!.serviceRequestId).toBe(42);
  });

  it('accepts edge coordinates (poles, dateline)', () => {
    expect(validateGpsInput({ lat: 90, lng: 180, serviceRequestId: 1 }).valid).toBe(true);
    expect(validateGpsInput({ lat: -90, lng: -180, serviceRequestId: 1 }).valid).toBe(true);
    expect(validateGpsInput({ lat: 0, lng: 0, serviceRequestId: 1 }).valid).toBe(true);
  });
});

// ─── validateStatusTransition ────────────────────────────────────────────────

describe('validateStatusTransition', () => {
  it('allows pending → confirmed', () => {
    expect(validateStatusTransition('pending', 'confirmed').valid).toBe(true);
  });

  it('allows pending → dispatched', () => {
    expect(validateStatusTransition('pending', 'dispatched').valid).toBe(true);
  });

  it('allows confirmed → dispatched', () => {
    expect(validateStatusTransition('confirmed', 'dispatched').valid).toBe(true);
  });

  it('allows dispatched → on_site', () => {
    expect(validateStatusTransition('dispatched', 'on_site').valid).toBe(true);
  });

  it('allows on_site → completed', () => {
    expect(validateStatusTransition('on_site', 'completed').valid).toBe(true);
  });

  // Backward transitions should be blocked
  it('blocks completed → dispatched', () => {
    const result = validateStatusTransition('completed', 'dispatched');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Cannot transition/);
  });

  it('blocks on_site → dispatched', () => {
    expect(validateStatusTransition('on_site', 'dispatched').valid).toBe(false);
  });

  it('blocks dispatched → confirmed', () => {
    expect(validateStatusTransition('dispatched', 'confirmed').valid).toBe(false);
  });

  it('blocks dispatched → pending', () => {
    expect(validateStatusTransition('dispatched', 'pending').valid).toBe(false);
  });

  // Skip transitions
  it('blocks confirmed → completed (skip)', () => {
    expect(validateStatusTransition('confirmed', 'completed').valid).toBe(false);
  });

  it('blocks pending → on_site (skip)', () => {
    expect(validateStatusTransition('pending', 'on_site').valid).toBe(false);
  });

  it('handles unknown current status', () => {
    const result = validateStatusTransition('mystery_status', 'dispatched');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unknown current status/);
  });
});

// ─── safeParseKvData ─────────────────────────────────────────────────────────

describe('safeParseKvData', () => {
  it('parses valid JSON object', () => {
    const data = safeParseKvData('{"center":{"lat":29.76,"lng":-95.37},"radius":2}');
    expect(data).toEqual({ center: { lat: 29.76, lng: -95.37 }, radius: 2 });
  });

  it('returns null for null input', () => {
    expect(safeParseKvData(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(safeParseKvData('')).toBeNull();
  });

  it('returns null for corrupt JSON', () => {
    expect(safeParseKvData('{not valid json')).toBeNull();
  });

  it('returns null for JSON that parses to a non-object', () => {
    expect(safeParseKvData('"just a string"')).toBeNull();
    expect(safeParseKvData('42')).toBeNull();
    expect(safeParseKvData('null')).toBeNull();
  });

  it('handles JSON arrays (returns them as objects)', () => {
    const data = safeParseKvData('[1,2,3]');
    expect(data).toEqual([1, 2, 3]);
  });
});
