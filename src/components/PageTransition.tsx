
'use client'

import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { getScrollPosition } from '@/utils/scrollStore'

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Restore scroll position when the new page mounts
  useEffect(() => {
    const restore = () => {
      const savedPos = getScrollPosition(pathname)
      if (savedPos > 0) {
        window.scrollTo({
          top: savedPos,
          behavior: 'instant'
        })
      }
    }

    // Attempt immediately
    restore()

    // Retry to override Next.js default scroll-to-top
    const t1 = setTimeout(restore, 10)
    const t2 = setTimeout(restore, 50)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
