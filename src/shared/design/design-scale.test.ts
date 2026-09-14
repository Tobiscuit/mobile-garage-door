import { describe, expect, it } from 'vitest';
// The generator and checker live in scripts/ so they run without a build
// (tsconfig allowJs types the import).
import { checkAll, contrastReport, evaluate, spaceStep, typeStep, PHI } from '../../../scripts/design-scale.mjs';

describe('design scale (specs/002-design-refresh/design.md §4–5)', () => {
  it('has no drift, ordering or contrast failures', () => {
    // Fails when a generated CSS block was hand-edited, a scale step stops
    // increasing somewhere between 390 and 1440px, body text drops below 16px,
    // or a colour pair falls under its WCAG ratio.
    expect(checkAll()).toEqual([]);
  });

  it('meets every contrast target it declares', () => {
    for (const pair of contrastReport()) {
      expect(pair.ratio, `${pair.fg} on ${pair.bg} (${pair.use})`).toBeGreaterThanOrEqual(Number(pair.minimum));
    }
  });

  it('interpolates body text from 16px at 390px to 18px at 1440px', () => {
    const body = typeStep(0);
    expect(evaluate(body.min, body.max, 390)).toBe(16);
    expect(evaluate(body.min, body.max, 1440)).toBe(18);
    expect(evaluate(body.min, body.max, 915)).toBeCloseTo(17, 5);
  });

  it('spaces steps by the golden ratio', () => {
    expect(spaceStep('m').max / spaceStep('s').max).toBeCloseTo(PHI, 10);
    expect(spaceStep('xl').min / spaceStep('l').min).toBeCloseTo(PHI, 10);
  });
});
