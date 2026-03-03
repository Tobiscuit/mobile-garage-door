'use client'

import Link from '@/shared/ui/Link'
import { useRouter } from 'next/navigation'
import { ReactNode, ComponentProps } from 'react'

interface SmartLinkProps extends ComponentProps<typeof Link> {
  children: ReactNode
  className?: string
  prefetchPriority?: 'high' | 'low'
  href: any
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
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
    >
      {children}
    </Link>
  )
}
