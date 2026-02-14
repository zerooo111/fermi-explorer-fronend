import { memo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ErrorStateProps {
  message: string
  description?: string
  className?: string
  onRetry?: () => void
}

export const ErrorState = memo(function ErrorState({ message, description, className, onRetry }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <AlertTriangle className="w-10 h-10 text-destructive/50 mb-3" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-3 py-1.5 text-xs font-mono border border-border hover:border-foreground text-muted-foreground hover:text-foreground transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
})
