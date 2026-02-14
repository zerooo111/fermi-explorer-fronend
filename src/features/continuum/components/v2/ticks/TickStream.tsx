import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, Wifi, WifiOff } from 'lucide-react'
import { useTickStream } from '@/features/continuum/api/hooks'
import { Badge, Button, Skeleton } from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils'
import { TimestampDisplay } from '../shared'
import { EmptyState } from '../shared'

interface TickStreamProps {
  className?: string
  displayLimit?: number
}

export const TickStream = memo(function TickStream({
  className,
  displayLimit = 50,
}: TickStreamProps) {
  const { ticks, isConnected, isConnecting } = useTickStream({ displayLimit })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isUserScrolled, setIsUserScrolled] = useState(false)
  const prevTickCountRef = useRef(0)

  // Track user scrolling
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    // If user has scrolled up from bottom, mark as user-scrolled
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setIsUserScrolled(!isAtBottom)
  }, [])

  // Auto-scroll to top when new ticks arrive (ticks are prepended)
  useEffect(() => {
    if (!isUserScrolled && ticks.length > prevTickCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
    prevTickCountRef.current = ticks.length
  }, [ticks.length, isUserScrolled])

  const jumpToLatest = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
      setIsUserScrolled(false)
    }
  }, [])

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm uppercase tracking-[0.15em] text-foreground font-medium">
          Live Stream
        </h3>
        <Badge variant={isConnected ? 'success' : isConnecting ? 'warning' : 'muted'}>
          {isConnected ? (
            <><Wifi className="w-3 h-3" /> Connected</>
          ) : isConnecting ? (
            'Connecting...'
          ) : (
            <><WifiOff className="w-3 h-3" /> Disconnected</>
          )}
        </Badge>
      </div>

      {/* Stream content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative border border-border overflow-y-auto max-h-[500px]"
        aria-live="polite"
        role="log"
      >
        {ticks.length === 0 ? (
          isConnected ? (
            <div className="p-6">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <p className="text-xs text-muted-foreground mt-2">Waiting for ticks...</p>
              </div>
            </div>
          ) : (
            <EmptyState message="Stream disconnected" description="Attempting to reconnect..." />
          )
        ) : (
          <div className="divide-y divide-border">
            {ticks.map(tick => (
              <div
                key={tick.tick_number}
                className="flex items-center justify-between px-4 py-2.5 text-xs font-mono hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-foreground font-medium tabular-nums">
                    #{tick.tick_number.toLocaleString()}
                  </span>
                  <Badge variant={tick.transaction_count > 0 ? 'success' : 'muted'} className="text-[9px]">
                    {tick.transaction_count} txn{tick.transaction_count !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <TimestampDisplay timestamp={tick.timestamp} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Jump to latest button */}
      {isUserScrolled && ticks.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="default"
            onClick={jumpToLatest}
            className="text-xs font-mono gap-1.5"
          >
            <ArrowDown className="w-3 h-3" />
            Jump to latest
          </Button>
        </div>
      )}
    </div>
  )
})
