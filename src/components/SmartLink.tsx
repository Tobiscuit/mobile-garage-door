'use client'

import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

interface SmartLinkProps extends LinkProps {
  children: ReactNode
  className?: string
  prefetchPriority?: 'high' | 'low'
}

export default function SmartLink({ 
  children, 
  prefetchPriority = 'high', 
  ...props 
}: SmartLinkProps) {
  const router = useRouter()

  // Prefetch on hover (desktop)
  const handleMouseEnter = () => {
    if (prefetchPriority === 'high') {
      router.prefetch(String(props.href))
    }
  }

  // Prefetch on touch start (mobile - faster than click)
  const handleTouchStart = () => {
    router.prefetch(String(props.href))
  }

  return (
    <Link 
      {...props} 
      scroll={false} // CRITICAL: Disable Next.js default scroll handling to allow custom restoration
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
    >
      {children}
    </Link>
  )
}
