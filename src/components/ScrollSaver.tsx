'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { saveScrollPosition } from '@/utils/scrollStore'

export default function ScrollSaver() {
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      saveScrollPosition(pathname, window.scrollY)
    }

    // Debounce slightly to improve performance
    let timeoutId: NodeJS.Timeout
    const debouncedScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 50)
    }

    window.addEventListener('scroll', debouncedScroll)
    
    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(timeoutId)
    }
  }, [pathname])

  return null
}
