import { memo } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  message: string
  description?: string
  className?: string
}

export const EmptyState = memo(function EmptyState({ message, description, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <Inbox className="w-10 h-10 text-muted-foreground/50 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      {description && <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>}
    </div>
  )
})
