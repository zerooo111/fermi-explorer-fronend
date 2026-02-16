import { Link } from '@tanstack/react-router'
import { Cube } from '@phosphor-icons/react'
import { useStatus } from '@/features/rollup/api/hooks'
import type { NodeStatus } from '@/features/rollup/types/api'
import { ExecutionMetrics } from '@/features/rollup/components/v2/metrics'
import { BlocksDataTable } from '@/features/rollup/components/v2/blocks'
import { StateRootViewer } from '@/features/rollup/components/v2/blocks'
import { Button } from '@/shared/components/ui'

export default function RollupHomepage() {
  const { data: rawStatus } = useStatus()
  const status = rawStatus as NodeStatus | undefined

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-8">
      <ExecutionMetrics />

      {status?.state_root && (
        <StateRootViewer current={status.state_root} />
      )}

      {/* Recent Blocks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="inline-flex items-center gap-2 font-pixel text-sm uppercase tracking-[0.15em] text-foreground font-medium">
            <Cube weight="duotone" className="w-4 h-4 text-accent" />
            Recent Blocks
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
