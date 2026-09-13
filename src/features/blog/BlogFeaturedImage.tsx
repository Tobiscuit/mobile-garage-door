'use client'

import Image from 'next/image'

interface BlogFeaturedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

// The same loader the blog pages used inline, unchanged, so image URLs stay
// identical. /api/media serves the stored object whatever `w` and `q` say; the
// query only gives next/image a distinct URL per srcset width.
function mediaLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return `${src}?w=${width}&q=${quality || 75}`
}

/**
 * A blog post's featured image.
 *
 * The loader lives here, inside a Client Component, because it is a function
 * and next/image is itself a Client Component under vinext 1.0. When the
 * blog's Server Component pages passed `loader` inline, the function could not
 * be serialized across the Server -> Client boundary: the server streamed an
 * RSC error row in place of the image, and the browser threw React error #441
 * into the error boundary on every post that has a featured image. Next.js
 * documents the rule: in the App Router a custom loader needs 'use client'.
 */
export default function BlogFeaturedImage({ src, alt, className, priority }: BlogFeaturedImageProps) {
  return <Image src={src} alt={alt} fill className={className} priority={priority} loader={mediaLoader} />
}
