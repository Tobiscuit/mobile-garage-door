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
    // Only start listening after 300ms (enough for browser restoration/reset)
    // Reduced from 700ms to capture fast interactions
    const startListeningTimer = setTimeout(() => {
        window.addEventListener('scroll', debouncedScroll)
    }, 300) 
    
    return () => {
      // Cleanup
      clearTimeout(startListeningTimer)
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(timeoutId)
      
      // FORCE SAVE ON UNMOUNT
      // This ensures that if the user clicks a link immediately after scrolling,
      // or if the debounce hasn't fired yet, we capture the final position.
      saveScrollPosition(pathname, window.scrollY)
    }
  }, [pathname])

  return null
}
