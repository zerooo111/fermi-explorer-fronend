import { memo } from 'react'
import { Cube } from '@phosphor-icons/react'
import { useStatus, useLatestBlock } from '@/features/rollup/api/hooks'
import type { NodeStatus, BlockWithDetails } from '@/features/rollup/types/api'
import { Stagger, StaggerItem } from '@/shared/components/ui'
import { MetricCard } from '@/features/continuum/components/v2/metrics/MetricCard'

export const ExecutionMetrics = memo(function ExecutionMetrics() {
  const { data: rawStatus, isLoading: statusLoading } = useStatus()
  const status = rawStatus as NodeStatus | undefined
  const { data: rawLatest, isLoading: latestLoading } = useLatestBlock()
  const latestBlock = rawLatest as BlockWithDetails | undefined

  const isLoading = statusLoading || latestLoading

  return (
    <Stagger className="flex flex-col gap-4" aria-live="polite" aria-label="Execution metrics">
      <StaggerItem>
        <div className="border border-border">
          <MetricCard
            label="Block Height"
            icon={Cube}
            value={latestBlock?.block.height ?? status?.block_height}
            isLoading={isLoading}
          />
        </div>
      </StaggerItem>
    </Stagger>
  )
})
