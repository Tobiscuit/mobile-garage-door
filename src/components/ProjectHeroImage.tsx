'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import { ReactNode } from 'react'

interface ProjectHeroImageProps {
  slug: string
  imageUrl: string | null
  title: string
}

export default function ProjectHeroImage({ slug, imageUrl, title }: ProjectHeroImageProps) {
  return (
    <motion.div 
      layoutId={`project-image-${slug}`}
      className="w-full aspect-video relative"
    >
      {imageUrl ? (
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        // Fallback Pattern
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#2c3e50] relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <span className="text-white/10 font-black text-6xl uppercase tracking-tighter relative z-10">Mobil</span>
            <div className="mt-4 px-3 py-1 border border-white/10 rounded text-[10px] font-mono text-white/30">IMG_MISSING_001</div>
        </div>
      )}
    </motion.div>
  )
}
