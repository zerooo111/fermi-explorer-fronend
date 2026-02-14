import { memo } from 'react'
import { Skeleton } from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils'

interface LoadingStateProps {
  variant?: 'page' | 'table' | 'card' | 'inline'
  rows?: number
  className?: string
}

export const LoadingState = memo(function LoadingState({
  variant = 'page',
  rows = 5,
  className,
}: LoadingStateProps) {
  if (variant === 'inline') {
    return <Skeleton className={cn('h-4 w-24', className)} />
  }

  if (variant === 'card') {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  // page variant
  return (
    <div className={cn('space-y-6', className)}>
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
})
