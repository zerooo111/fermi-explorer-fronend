import { memo, useMemo } from 'react'
import { Clock } from '@phosphor-icons/react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils'

interface TimestampDisplayProps {
  timestamp: number // microseconds
  className?: string
}

function formatRelative(microseconds: number): string {
  const ms = microseconds / 1000
  const seconds = Math.floor((Date.now() - ms) / 1000)

  if (seconds < 0) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function formatAbsolute(microseconds: number): string {
  const date = new Date(microseconds / 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export const TimestampDisplay = memo(function TimestampDisplay({
  timestamp,
  className,
}: TimestampDisplayProps) {
  const relative = useMemo(() => formatRelative(timestamp), [timestamp])
  const absolute = useMemo(() => formatAbsolute(timestamp), [timestamp])

  return (
    <Tooltip>
      <TooltipTrigger>
        <time className={cn('inline-flex items-center gap-1 font-mono text-xs text-muted-foreground', className)}>
          <Clock weight="bold" className="w-3 h-3" />
          {relative}
        </time>
      </TooltipTrigger>
      <TooltipContent>{absolute}</TooltipContent>
    </Tooltip>
  )
})
