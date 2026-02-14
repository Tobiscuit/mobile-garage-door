
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
    // Disable browser's native scroll restoration to prevent conflicts
    if (typeof window !== 'undefined' && window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const savedPos = getScrollPosition(pathname)
    
    if (savedPos > 0) {
      const restoreScroll = () => {
        const docHeight = document.documentElement.scrollHeight
        const winHeight = window.innerHeight

        // If page is ready to support the scroll position
        if (docHeight >= savedPos + winHeight / 2) { // Allow some slack (half screen)
          window.scrollTo({
            top: savedPos,
            behavior: 'instant'
          })
          return true // Success
        }
        return false // Keep waiting
      }

      // 1. Try immediately
      if (restoreScroll()) return

      // 2. Use ResizeObserver to detect content loading (images, data, etc.)
      const observer = new ResizeObserver(() => {
        if (restoreScroll()) {
          observer.disconnect() // Stop watching once success
        }
      })
      
      observer.observe(document.body)
      observer.observe(document.documentElement)

      // 3. Safety timeout to stop observing after 2 seconds (in case page is just short)
      const timeout = setTimeout(() => observer.disconnect(), 2000)

      return () => {
        observer.disconnect()
        clearTimeout(timeout)
      }
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
