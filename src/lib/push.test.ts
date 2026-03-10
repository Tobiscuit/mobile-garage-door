import { describe, it, expect } from 'vitest';
import { getMilestoneNotification } from './push';

describe('getMilestoneNotification', () => {
  const techName = 'Mike';

  // ─── English ────────────────────────────────────────────────────────

  it('returns correct eta_15 notification (en)', () => {
    const n = getMilestoneNotification('eta_15', techName, 'en');
    expect(n.title).toContain('on the way');
    expect(n.body).toContain(techName);
    expect(n.body).toContain('15 minutes');
    expect(n.tag).toBe('milestone-eta_15');
    expect(n.data?.milestone).toBe('eta_15');
  });

  it('returns correct eta_3 notification (en)', () => {
    const n = getMilestoneNotification('eta_3', techName, 'en');
    expect(n.title).toContain('Almost there');
    expect(n.body).toContain(techName);
    expect(n.body).toContain('3 minutes');
  });

  // ─── Spanish ────────────────────────────────────────────────────────

  it('returns correct eta_15 notification (es)', () => {
    const n = getMilestoneNotification('eta_15', techName, 'es');
    expect(n.title).toContain('camino');
    expect(n.body).toContain(techName);
    expect(n.body).toContain('15 minutos');
  });

  it('returns correct eta_3 notification (es)', () => {
    const n = getMilestoneNotification('eta_3', techName, 'es');
    expect(n.title).toContain('llega');
    expect(n.body).toContain('3 minutos');
  });

  // ─── Vietnamese ─────────────────────────────────────────────────────

  it('returns correct eta_15 notification (vi)', () => {
    const n = getMilestoneNotification('eta_15', techName, 'vi');
    expect(n.title).toContain('đường đến');
    expect(n.body).toContain(techName);
    expect(n.body).toContain('15 phút');
  });

  it('returns correct eta_3 notification (vi)', () => {
    const n = getMilestoneNotification('eta_3', techName, 'vi');
    expect(n.title).toContain('Sắp đến');
    expect(n.body).toContain('3 phút');
  });

  // ─── Fallback ───────────────────────────────────────────────────────

  it('falls back to English for unknown locale', () => {
    const n = getMilestoneNotification('eta_15', techName, 'fr');
    expect(n.title).toContain('on the way');
    expect(n.body).toContain('15 minutes');
  });

  it('defaults to English when no locale provided', () => {
    const n = getMilestoneNotification('eta_15', techName);
    expect(n.title).toContain('on the way');
  });

  // ─── Data structure ─────────────────────────────────────────────────

  it('includes tag and milestone data for all notifications', () => {
    const n15 = getMilestoneNotification('eta_15', techName, 'en');
    const n3 = getMilestoneNotification('eta_3', techName, 'en');

    expect(n15.tag).toBe('milestone-eta_15');
    expect(n3.tag).toBe('milestone-eta_3');
    expect(n15.data?.milestone).toBe('eta_15');
    expect(n3.data?.milestone).toBe('eta_3');
  });

  it('injects tech name into notification body', () => {
    const n = getMilestoneNotification('eta_15', 'Carlos García', 'en');
    expect(n.body).toContain('Carlos García');
  });
});
