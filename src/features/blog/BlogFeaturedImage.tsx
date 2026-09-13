'use client'

import Image from 'next/image'

interface BlogFeaturedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  /** How wide the image renders, for the browser's candidate choice. */
  sizes: string
}

/**
 * A blog post's featured image.
 *
 * It stays a Client Component because next/image is one under vinext 1.0.
 *
 * It no longer passes a custom `loader`. Under vinext 1.0, a loader on a
 * `fill` image is called once with `width: 0` and no srcset is generated, so
 * every image was requested as `?w=0&q=75` whatever `sizes` said. The query
 * bought nothing: /api/media serves the stored object whatever `w` and `q`
 * say, and `images.unoptimized` is on for the whole site. Without the loader
 * the request is the object URL itself: one cache key per image, and no
 * function prop that could fail to cross the Server → Client boundary
 * (React error #441).
 *
 * `sizes` is still required and passed through, so the markup stays correct
 * the day these images gain a resizing srcset.
 */
export default function BlogFeaturedImage({ src, alt, className, priority, sizes }: BlogFeaturedImageProps) {
  return <Image src={src} alt={alt} fill className={className} priority={priority} sizes={sizes} />
}
