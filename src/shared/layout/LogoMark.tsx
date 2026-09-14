import React from 'react';

/**
 * The logo mark: a tight crop (1043×717) of public/images/logos/logo.jpg, in
 * AVIF with a WebP fallback, generated with sharp (specs/002-design-refresh/design.md §9).
 *
 * - `header`: a fixed 56px-tall mark, chosen by pixel density (2–11 KB, instead
 *   of the 465 KB JPEG the header used to scale down to 40px).
 * - `feature`: a larger mark chosen by rendered width through `sizes`.
 *
 * Decorative by default (alt=""): wherever it appears, the visible text next to
 * it already names the business. No directive, so server components and the
 * client header can both render it.
 */
const VARIANTS = {
  header: {
    avif: '/images/logos/logo-mark-56.avif 1x, /images/logos/logo-mark-112.avif 2x, /images/logos/logo-mark-168.avif 3x',
    webp: '/images/logos/logo-mark-56.webp 1x, /images/logos/logo-mark-112.webp 2x, /images/logos/logo-mark-168.webp 3x',
    src: '/images/logos/logo-mark-112.webp',
    width: 81,
    height: 56,
    sizes: undefined,
  },
  feature: {
    avif: '/images/logos/logo-mark-w320.avif 320w, /images/logos/logo-mark-w640.avif 640w, /images/logos/logo-mark-w960.avif 960w',
    webp: '/images/logos/logo-mark-w320.webp 320w, /images/logos/logo-mark-w640.webp 640w, /images/logos/logo-mark-w960.webp 960w',
    src: '/images/logos/logo-mark-w640.webp',
    width: 320,
    height: 220,
    // Rendered at min(100%, --space-2xl × φ²): 287px on a phone, 323px on a laptop.
    sizes: '20.2rem',
  },
} as const;

export function LogoMark({
  className,
  alt = '',
  variant = 'header',
  priority = false,
}: {
  className?: string;
  alt?: string;
  variant?: keyof typeof VARIANTS;
  /** For the one image likely to be the LCP element (web.dev: fetchpriority="high", never lazy). */
  priority?: boolean;
}) {
  const v = VARIANTS[variant];
  return (
    <picture>
      <source type="image/avif" srcSet={v.avif} sizes={v.sizes} />
      <source type="image/webp" srcSet={v.webp} sizes={v.sizes} />
      <img
        className={className}
        src={v.src}
        width={v.width}
        height={v.height}
        alt={alt}
        decoding={priority ? undefined : 'async'}
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
