#!/usr/bin/env node
/**
 * Design scale: the single source of truth for the public site's fluid type
 * scale, spacing scale and colour tokens, plus the checker that keeps the CSS
 * honest.
 *
 *   node scripts/design-scale.mjs          print the generated token blocks
 *   node scripts/design-scale.mjs --write  rewrite the generated blocks in place
 *   node scripts/design-scale.mjs --check  exit 1 if the CSS drifted from this
 *                                          file, a scale step is out of order,
 *                                          or a contrast pair fails WCAG AA
 *
 * Every size in the generated blocks is computed here from four inputs — two
 * viewport widths, a base size, and two ratios — and every colour from the two
 * reds sampled from the logo (see specs/002-design-refresh/design.md). No
 * dependencies: the OKLCH maths is Björn Ottosson's published OKLab transform.
 * The unit test src/shared/design/design-scale.test.ts runs checkAll() in CI.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ─── Inputs ───────────────────────────────────────────────────────────────────

/** Fluid range: an iPhone-class phone (390 CSS px) to a common laptop (1440). */
export const VIEWPORT = { min: 390, max: 1440 };
/** Browsers' default root font size; rem values are expressed against it. */
export const ROOT_FONT_PX = 16;
/** The golden ratio. Used for spacing and layout proportion, not for type. */
export const PHI = (1 + Math.sqrt(5)) / 2;

export const TYPE = {
  /** Body copy: 16px on a phone (no iOS zoom-on-focus), 18px on a laptop. */
  baseMin: 16,
  baseMax: 18,
  /** Minor third on a phone, perfect fourth on a laptop. */
  ratioMin: 6 / 5,
  ratioMax: 4 / 3,
  /** -1 is the smallest step: at ratios this far apart, -2 would shrink as the viewport grows. */
  steps: [-1, 0, 1, 2, 3, 4, 5],
};

/** Spacing steps are powers of φ around the body size. */
export const SPACE = {
  steps: { '3xs': -3, '2xs': -2, xs: -1, s: 0, m: 1, l: 2, xl: 3, '2xl': 4 },
  /** Fluid pairs: the first step's phone size to the second step's laptop size. */
  pairs: [['s', 'm'], ['m', 'l'], ['l', 'xl'], ['xl', '2xl']],
};

/** Reds sampled from the logo files (median of interior pixels; see design.md). */
export const LOGO = {
  red: '#ba233f', // ring logo: public/icon-512x512.png (lossless), matches logo.jpg
  redLockup: '#cb243c', // 2025 SVG lockups: logo-desktop.svg colour layer (lossless)
};

// ─── Fluid maths ──────────────────────────────────────────────────────────────

const round = (n, places = 4) => Number(n.toFixed(places));
const rem = (px) => `${round(px / ROOT_FONT_PX)}rem`;

/** clamp() that is `minPx` at VIEWPORT.min and `maxPx` at VIEWPORT.max, linear between. */
export function fluid(minPx, maxPx) {
  if (maxPx < minPx) throw new Error(`fluid(): ${minPx}px → ${maxPx}px shrinks as the viewport grows`);
  const slope = (maxPx - minPx) / (VIEWPORT.max - VIEWPORT.min);
  const interceptPx = minPx - slope * VIEWPORT.min;
  return `clamp(${rem(minPx)}, ${rem(interceptPx)} + ${round(slope * 100)}vw, ${rem(maxPx)})`;
}

/** Evaluate a fluid() pair at a viewport width, in px (what the browser computes). */
export function evaluate(minPx, maxPx, viewport) {
  const slope = (maxPx - minPx) / (VIEWPORT.max - VIEWPORT.min);
  const value = minPx + slope * (viewport - VIEWPORT.min);
  return Math.min(Math.max(value, minPx), maxPx);
}

export function typeStep(n) {
  return { min: TYPE.baseMin * TYPE.ratioMin ** n, max: TYPE.baseMax * TYPE.ratioMax ** n };
}

export function spaceStep(name) {
  const n = SPACE.steps[name];
  return { min: TYPE.baseMin * PHI ** n, max: TYPE.baseMax * PHI ** n };
}

// ─── Colour maths (OKLab, CSS Color 4) ────────────────────────────────────────

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

export function rgbToOklch([r, g, b]) {
  const [R, G, B] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  const H = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { l: L, c: C, h: H };
}

/** Linear-light sRGB, unclamped, so callers can test gamut membership. */
function oklchToLinearRgb({ l: L, c: C, h: H }) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (lin) => lin.every((v) => v >= -1e-6 && v <= 1 + 1e-6);

/** Reduce chroma until the colour fits sRGB (CSS Color 4's chroma-reduction idea, binary search). */
export function gamutMap(color) {
  if (inGamut(oklchToLinearRgb(color))) return color;
  let lo = 0;
  let hi = color.c;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearRgb({ ...color, c: mid }))) lo = mid;
    else hi = mid;
  }
  return { ...color, c: lo };
}

export function oklchToRgb(color) {
  return oklchToLinearRgb(gamutMap(color)).map((v) => toGamma(Math.min(Math.max(v, 0), 1)));
}

export function luminance(rgb) {
  const [R, G, B] = rgb.map(toLinear);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** color-mix(in oklch, a p, b) for opaque colours; an achromatic side takes the other's hue. */
export function mixOklch(a, b, p) {
  const achromatic = (x) => x.c < 1e-4;
  const h = achromatic(a) ? b.h : achromatic(b) ? a.h : a.h * p + b.h * (1 - p);
  return { l: a.l * p + b.l * (1 - p), c: a.c * p + b.c * (1 - p), h };
}

const WHITE = { l: 1, c: 0, h: 0 };
const formatOklch = ({ l, c, h }) => `oklch(${round(l * 100, 2)}% ${round(c, 4)} ${round(h, 2)})`;

/** Lightest version of `color` (same hue and chroma intent) that reaches `ratio` against `against`. */
function lightestAtContrast(color, against, ratio) {
  let lo = 0;
  let hi = color.l;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const candidate = gamutMap({ ...color, l: mid });
    if (contrast(oklchToRgb(candidate), against) >= ratio) lo = mid;
    else hi = mid;
  }
  return gamutMap({ ...color, l: lo });
}

/** Smallest share of `ink` mixed into white that reaches `ratio` against `backgroundRgb`. */
function minimumInkShare(ink, backgroundRgb, ratio) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (contrast(oklchToRgb(mixOklch(ink, WHITE, mid)), backgroundRgb) >= ratio) hi = mid;
    else lo = mid;
  }
  return hi;
}

// ─── Colour tokens ────────────────────────────────────────────────────────────

/**
 * Ratios the derived tokens are solved for. Each is WCAG's threshold plus a
 * small margin, so browser rounding cannot push a pair under the line.
 */
export const CONTRAST_TARGETS = {
  text: 4.5 + 0.3, // SC 1.4.3 AA, normal text
  enhanced: 7 + 0.3, // SC 1.4.6 AAA — used for white body text on the deep red
  ui: 3 + 0.3, // SC 1.4.11 AA, component boundaries and focus indicators
};

/** Inks keep the logo red's hue so the neutrals read warm, not grey-blue. */
const INK_LIGHTNESS = 0.2; // near-black: the darkest step that still reads as a tinted neutral
const INK_CHROMA = 0.02;
/** Blush surface: the red at this share of white. */
const TINT_SHARE = 0.06;
/** Hairline separators: decorative, so no contrast requirement applies. */
const HAIRLINE_SHARE = 0.14;

export function colorTokens() {
  const red = rgbToOklch(hexToRgb(LOGO.red));
  const redLockup = rgbToOklch(hexToRgb(LOGO.redLockup));
  const ink = { l: INK_LIGHTNESS, c: INK_CHROMA, h: red.h };
  const white = [1, 1, 1];

  const redStrong = lightestAtContrast(red, white, CONTRAST_TARGETS.enhanced);
  // One golden-ratio step down in OKLCH lightness, which is perceptually
  // uniform: dark enough to read as a separate surface directly under a red band.
  const redDeep = gamutMap({ ...red, l: red.l / PHI });
  const tint = mixOklch(red, WHITE, TINT_SHARE);
  // Muted text must also pass on the blush tint, which is darker than white, so
  // it is solved against the tint: passing there implies passing on white.
  const inkMuted = mixOklch(ink, WHITE, minimumInkShare(ink, oklchToRgb(tint), CONTRAST_TARGETS.text));
  // Input borders sit on white fields.
  const lineStrong = mixOklch(ink, WHITE, minimumInkShare(ink, white, CONTRAST_TARGETS.ui));
  const line = mixOklch(ink, WHITE, HAIRLINE_SHARE);

  return {
    'brand-red': { value: LOGO.red, oklch: red, source: 'logo: ring mark' },
    'brand-red-lockup': { value: LOGO.redLockup, oklch: redLockup, source: 'logo: 2025 SVG lockup' },
    'brand-red-strong': { value: formatOklch(redStrong), oklch: redStrong, source: `logo red, lightness solved for ${CONTRAST_TARGETS.enhanced}:1 with white` },
    'brand-red-deep': { value: formatOklch(redDeep), oklch: redDeep, source: 'logo red, lightness divided by phi' },
    'brand-tint': { value: formatOklch(tint), oklch: tint, source: `logo red at ${round(TINT_SHARE * 100, 2)}% in white` },
    'brand-white': { value: '#ffffff', oklch: WHITE, source: 'white' },
    'brand-ink': { value: formatOklch(ink), oklch: ink, source: 'near-black at the logo red hue' },
    'brand-ink-muted': { value: formatOklch(inkMuted), oklch: inkMuted, source: `ink share solved for ${CONTRAST_TARGETS.text}:1 on the tint` },
    'brand-line-strong': { value: formatOklch(lineStrong), oklch: lineStrong, source: `ink share solved for ${CONTRAST_TARGETS.ui}:1 on white` },
    'brand-line': { value: formatOklch(line), oklch: line, source: `ink at ${round(HAIRLINE_SHARE * 100, 2)}% in white (decorative)` },
  };
}

/** Foreground/background pairs the design actually uses, with the ratio each must reach. */
export const CONTRAST_PAIRS = [
  ['brand-ink', 'brand-white', 4.5, 'body text'],
  ['brand-ink', 'brand-tint', 4.5, 'body text on blush sections'],
  ['brand-ink-muted', 'brand-white', 4.5, 'secondary text'],
  ['brand-ink-muted', 'brand-tint', 4.5, 'secondary text on blush sections'],
  ['brand-red', 'brand-white', 4.5, 'red links, eyebrows and headings on white'],
  ['brand-red', 'brand-tint', 4.5, 'red links on blush sections'],
  ['brand-white', 'brand-red', 4.5, 'white text on red buttons and bands'],
  ['brand-white', 'brand-red-lockup', 4.5, 'white text on the lockup-red band'],
  ['brand-white', 'brand-red-strong', 7, 'white text on hovered and pressed red buttons'],
  ['brand-white', 'brand-red-deep', 7, 'white body text on the deep red footer'],
  ['brand-line-strong', 'brand-white', 3, 'input borders (SC 1.4.11)'],
  ['brand-red', 'brand-white', 3, 'focus ring on light surfaces (SC 1.4.11 / 2.4.13)'],
  ['brand-white', 'brand-red', 3, 'focus ring on red surfaces'],
  ['brand-white', 'brand-red-deep', 3, 'focus ring on the deep red footer'],
];

// ─── Generated CSS ────────────────────────────────────────────────────────────

export function scaleCss() {
  const lines = [];
  for (const n of TYPE.steps) {
    const { min, max } = typeStep(n);
    lines.push(`  --step-${n < 0 ? `n${-n}` : n}: ${fluid(min, max)};`);
  }
  // The hero headline spans two steps: step 4 on a phone, step 5 on a laptop.
  lines.push(`  --step-display: ${fluid(typeStep(4).min, typeStep(5).max)};`);
  for (const name of Object.keys(SPACE.steps)) {
    const { min, max } = spaceStep(name);
    lines.push(`  --space-${name}: ${fluid(min, max)};`);
  }
  for (const [a, b] of SPACE.pairs) {
    lines.push(`  --space-${a}-${b}: ${fluid(spaceStep(a).min, spaceStep(b).max)};`);
  }
  return lines.join('\n');
}

export function themeCss() {
  return Object.entries(colorTokens())
    .map(([name, token]) => `  --color-${name}: ${token.value}; /* ${token.source} */`)
    .join('\n');
}

const BLOCKS = [
  { file: 'src/app/brand-theme.css', marker: 'design-scale:colors', render: themeCss },
  { file: 'src/app/(site)/(public)/(localized)/[locale]/site.css', marker: 'design-scale:scale', render: scaleCss },
];

function replaceBlock(source, marker, body) {
  const pattern = new RegExp(`(/\\* <${marker}> \\*/\\n)[\\s\\S]*?(\\n\\s*/\\* </${marker}> \\*/)`);
  if (!pattern.test(source)) throw new Error(`marker <${marker}> not found`);
  return source.replace(pattern, `$1${body}$2`);
}

// ─── Checks ───────────────────────────────────────────────────────────────────

export function checkAll() {
  const failures = [];

  // 1. Generated blocks match this file exactly.
  for (const { file, marker, render } of BLOCKS) {
    const path = join(ROOT, file);
    const source = readFileSync(path, 'utf8');
    try {
      if (replaceBlock(source, marker, render()) !== source) failures.push(`${file}: <${marker}> is stale — run node scripts/design-scale.mjs --write`);
    } catch (error) {
      failures.push(`${file}: ${error.message}`);
    }
  }

  // 2. Every type and space step is strictly ordered at every viewport in range.
  for (let vw = VIEWPORT.min; vw <= VIEWPORT.max; vw += 10) {
    const type = TYPE.steps.map((n) => evaluate(typeStep(n).min, typeStep(n).max, vw));
    const space = Object.keys(SPACE.steps).map((name) => evaluate(spaceStep(name).min, spaceStep(name).max, vw));
    for (const [label, values] of [['type', type], ['space', space]]) {
      values.slice(1).forEach((v, i) => {
        if (!(v > values[i])) failures.push(`${label} scale is not increasing at ${vw}px (step ${i} → ${i + 1})`);
      });
    }
  }
  if (typeStep(0).min < 16) failures.push('body text is smaller than 16px on phones');

  // 3. Contrast pairs meet their WCAG threshold.
  const tokens = colorTokens();
  const rgb = (name) => (tokens[name].value.startsWith('#') ? hexToRgb(tokens[name].value) : oklchToRgb(tokens[name].oklch));
  for (const [fg, bg, minimum, use] of CONTRAST_PAIRS) {
    const ratio = contrast(rgb(fg), rgb(bg));
    if (ratio < minimum) failures.push(`contrast ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${minimum}:1 (${use})`);
  }

  return failures;
}

export function contrastReport() {
  const tokens = colorTokens();
  const rgb = (name) => (tokens[name].value.startsWith('#') ? hexToRgb(tokens[name].value) : oklchToRgb(tokens[name].oklch));
  return CONTRAST_PAIRS.map(([fg, bg, minimum, use]) => ({ fg, bg, ratio: round(contrast(rgb(fg), rgb(bg)), 2), minimum, use }));
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  if (mode === '--write') {
    for (const { file, marker, render } of BLOCKS) {
      const path = join(ROOT, file);
      writeFileSync(path, replaceBlock(readFileSync(path, 'utf8'), marker, render()));
      console.log(`wrote <${marker}> in ${file}`);
    }
  } else if (mode === '--check') {
    const failures = checkAll();
    for (const failure of failures) console.error(`✗ ${failure}`);
    if (failures.length) process.exit(1);
    console.log('✓ design scale and colour tokens are consistent');
  } else {
    console.log(':root {\n' + scaleCss() + '\n}\n\n@theme {\n' + themeCss() + '\n}');
    console.table(contrastReport());
  }
}
