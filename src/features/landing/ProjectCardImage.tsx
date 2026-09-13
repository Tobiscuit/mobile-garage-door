'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { LogoMark } from '@/shared/layout/LogoMark'

interface ProjectCardImageProps {
  slug: string
  imageUrl: string | null
  title: string
  /** Shown when a project has no photo yet (replaces the debug text "IMG_MISSING_001"). */
  placeholderLabel?: string
}

export default function ProjectCardImage({ slug, imageUrl, title, placeholderLabel }: ProjectCardImageProps) {
  return (
    <motion.div
      layoutId={`project-image-${slug}`}
      className="absolute inset-0 z-0 bg-brand-tint"
    >
      <div className="relative h-full w-full pointer-events-none">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(min-width: 48em) 50vw, 100vw"
          />
        ) : (
          <div className="project-placeholder">
            <LogoMark variant="feature" />
            {placeholderLabel && <span>{placeholderLabel}</span>}
          </div>
        )}
      </div>
    </motion.div>
  )
}
