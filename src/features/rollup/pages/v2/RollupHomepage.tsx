import { Link } from '@tanstack/react-router'
import { useStatus, useLatestBlock } from '@/features/rollup/api/hooks'
import type { NodeStatus, BlockWithDetails } from '@/features/rollup/types/api'
import { BlocksDataTable } from '@/features/rollup/components/v2/blocks'
import { MetricCard } from '@/features/continuum/components/v2/metrics'
import { StateRootViewer } from '@/features/rollup/components/v2/blocks'
import {
  Stagger, StaggerItem, Button, PageSkeleton, TableSkeleton,
} from '@/shared/components/ui'

export default function RollupHomepage() {
  const { data: rawStatus, isLoading: statusLoading } = useStatus()
  const status = rawStatus as NodeStatus | undefined
  const { data: rawLatest, isLoading: latestLoading } = useLatestBlock()
  const latestBlock = rawLatest as BlockWithDetails | undefined

  if (statusLoading || latestLoading) {
    return (
      <PageSkeleton titleWidth="w-1/3">
        <TableSkeleton rows={10} />
      </PageSkeleton>
    )
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-8">
      {/* Metrics */}
      <Stagger className="flex flex-col gap-4">
        <StaggerItem>
          <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-border border border-border">
            <MetricCard
              label="Latest Block"
              value={latestBlock?.block.height ?? status?.block_height}
            />
            <MetricCard
              label="Applied Batches"
              value={status?.applied_batches}
            />
            <MetricCard
              label="Total Txns"
              value={latestBlock?.block.transaction_ids.length}
              className="hidden md:flex"
            />
          </div>
        </StaggerItem>
      </Stagger>

      {/* State Root */}
      {status?.state_root && (
        <StateRootViewer current={status.state_root} />
      )}

      {/* Recent Blocks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-sm uppercase tracking-[0.15em] text-foreground font-medium">
            Latest Blocks
          </h2>
          <Link to="/execution/blocks">
            <Button variant="ghost" className="text-xs font-mono">View All</Button>
          </Link>
        </div>
        <BlocksDataTable limit={10} />
      </section>
    </div>
  )
}
