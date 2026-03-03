
'use client'

import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useLayoutEffect, useState } from 'react'
import { getScrollPosition } from '@/shared/store/scrollStore'

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
    } else {
      // If no saved position (new page or top), ensure we start at the top
      // This is critical when using mode="popLayout" or manual restoration
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        initial={{ opacity: 1 }} // Start fully visible to allow shared element morph
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }} // Do not fade out, let the new page cover it or use a different transition
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
