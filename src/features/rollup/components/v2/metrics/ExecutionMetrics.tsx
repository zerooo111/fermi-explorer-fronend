import { memo } from 'react'
import { Cube, Stack, Receipt, X, Lightning } from '@phosphor-icons/react'
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
        <div className="grid grid-cols-2 divide-x divide-border border border-border">
          <MetricCard
            label="Block Height"
            icon={Cube}
            value={latestBlock?.block.height ?? status?.block_height}
            isLoading={isLoading}
          />
          <MetricCard
            label="Applied Batches"
            icon={Stack}
            value={latestBlock?.block.applied_batches ?? status?.applied_batches}
            isLoading={isLoading}
          />
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="grid grid-cols-3 divide-x divide-border border border-border">
          <MetricCard
            label="Total Orders"
            icon={Receipt}
            value={latestBlock?.block.total_orders}
            isLoading={isLoading}
          />
          <MetricCard
            label="Total Cancels"
            icon={X}
            value={latestBlock?.block.total_cancels}
            isLoading={isLoading}
          />
          <MetricCard
            label="Txns in Block"
            icon={Lightning}
            value={latestBlock?.block.transaction_ids.length}
            isLoading={isLoading}
          />
        </div>
      </StaggerItem>
    </Stagger>
  )
})
