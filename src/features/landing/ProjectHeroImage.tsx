'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { LogoMark } from '@/shared/layout/LogoMark'

interface ProjectHeroImageProps {
  slug: string
  imageUrl: string | null
  title: string
  /** Shown when a project has no photo yet (replaces the debug text "IMG_MISSING_001"). */
  placeholderLabel?: string
}

export default function ProjectHeroImage({ slug, imageUrl, title, placeholderLabel }: ProjectHeroImageProps) {
  return (
    <motion.div
      layoutId={`project-image-${slug}`}
      className="relative aspect-video w-full"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 90em) 84rem, 100vw"
        />
      ) : (
        <div className="project-placeholder">
          <LogoMark variant="feature" />
          {placeholderLabel && <span>{placeholderLabel}</span>}
        </div>
      )}
    </motion.div>
  )
}
