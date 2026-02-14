'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { saveScrollPosition } from '@/utils/scrollStore'

export default function ScrollSaver() {
  const pathname = usePathname()

  useEffect(() => {
    // 1. Define the saver
    const handleScroll = () => {
      saveScrollPosition(pathname, window.scrollY)
    }

    // 2. Debounce wrapper - Increased to 100ms to ensure cleanup runs before save
    let timeoutId: NodeJS.Timeout
    const debouncedScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 100)
    }

    // 3. IGNORE initial scroll events (restoration/reset)
    // Only start listening after 700ms (animation duration + buffer)
    // This prevents capturing the "scroll to top" or "scroll to restored" as a user action
    const startListeningTimer = setTimeout(() => {
        window.addEventListener('scroll', debouncedScroll)
    }, 700) 
    
    return () => {
      // Cleanup
      clearTimeout(startListeningTimer)
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(timeoutId) // CRITICAL: This cancels any pending save (like the scroll-to-top 0)
    }
  }, [pathname])

  return null
}
