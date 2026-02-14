import { memo } from 'react'
import { cn } from '@/shared/lib/utils'
import { AnimatedNumber, Skeleton } from '@/shared/components/ui'
import type { FormatType } from '@/shared/components/ui'

interface MetricCardProps {
  label: string
  value: number | undefined
  format?: FormatType
  decimals?: number
  suffix?: string
  isLoading?: boolean
  className?: string
}

export const MetricCard = memo(function MetricCard({
  label,
  value,
  format = 'raw',
  decimals = 0,
  suffix,
  isLoading,
  className,
}: MetricCardProps) {
  return (
    <div className={cn('flex flex-col gap-1 p-3 sm:p-4', className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">
        {label}
      </span>
      {isLoading ? (
        <Skeleton className="h-7 sm:h-9 w-24" />
      ) : (
        <span className="text-xl sm:text-3xl font-bold text-foreground font-mono tabular-nums">
          <AnimatedNumber value={value ?? 0} format={format} decimals={decimals} />
          {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
        </span>
      )}
    </div>
  )
})
