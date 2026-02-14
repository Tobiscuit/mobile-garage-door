
'use client'

import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useLayoutEffect, useState } from 'react'
import { getScrollPosition } from '@/utils/scrollStore'

// Use useLayoutEffect on client, useEffect on server to avoid warnings
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Restore scroll position when the new page mounts
  useIsomorphicLayoutEffect(() => {
    const savedPos = getScrollPosition(pathname)
    
    if (savedPos > 0) {
      // We need to wait for the DOM to be painted and have height
      const attemptScroll = (attempts = 0) => {
        // If we've tried too many times (e.g., 500ms), give up
        if (attempts > 50) return

        const docHeight = document.documentElement.scrollHeight
        const winHeight = window.innerHeight

        // If the page is tall enough to scroll to the saved position
        if (docHeight >= savedPos + winHeight || docHeight >= savedPos) {
          window.scrollTo({
            top: savedPos,
            behavior: 'instant'
          })
        } else {
          // If page not tall enough yet, wait for next frame
          requestAnimationFrame(() => attemptScroll(attempts + 1))
        }
      }

      attemptScroll()
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
