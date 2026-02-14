'use client'

import { motion } from 'motion/react'
import Image from 'next/image'

interface ProjectCardImageProps {
  slug: string
  imageUrl: string | null
  title: string
}

export default function ProjectCardImage({ slug, imageUrl, title }: ProjectCardImageProps) {
  return (
    <motion.div 
      layoutId={`project-image-${slug}`}
      className="absolute inset-0 bg-[#2c3e50] z-0"
    >
      <div className="w-full h-full relative transition-transform duration-700 group-hover:scale-105 pointer-events-none">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          // Fallback Pattern: Blueprint Style
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#2c3e50] relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <span className="text-white/10 font-black text-6xl uppercase tracking-tighter relative z-10">Mobil</span>
            <div className="mt-4 px-3 py-1 border border-white/10 rounded text-[10px] font-mono text-white/30">IMG_MISSING_001</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
