import { memo, useState, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { BatchSummary as BatchSummaryType } from '@/features/rollup/types/api'
import { Card, CardContent, Badge } from '@/shared/components/ui'
import { HashDisplay } from '@/features/continuum/components/v2/shared'
import { EmptyState } from '@/features/continuum/components/v2/shared'

interface BatchSummaryViewProps {
  batches: BatchSummaryType[]
}

const BatchRow = memo(function BatchRow({ batch }: { batch: BatchSummaryType }) {
  const [expanded, setExpanded] = useState(false)
  const toggle = useCallback(() => setExpanded(v => !v), [])

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-card transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="font-mono text-xs font-medium">Batch #{batch.index}</span>
          <Badge variant="muted" className="text-[9px]">Tick #{batch.tick_number}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={batch.order_count > 0 ? 'success' : 'muted'} className="text-[9px]">
            {batch.order_count} orders
          </Badge>
          <Badge variant={batch.cancel_count > 0 ? 'warning' : 'muted'} className="text-[9px]">
            {batch.cancel_count} cancels
          </Badge>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2 bg-secondary/30">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Batch Hash:</span>
            <HashDisplay hash={batch.batch_hash} />
          </div>
          {batch.continuum_sequences.length > 0 && (
            <div className="text-xs">
              <span className="text-muted-foreground">Sequences: </span>
              <span className="font-mono">{batch.continuum_sequences.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export const BatchSummaryView = memo(function BatchSummaryView({ batches }: BatchSummaryViewProps) {
  if (batches.length === 0) {
    return <EmptyState message="No batches in this block" />
  }

  return (
    <Card variant="default">
      <CardContent className="p-0">
        <div className="px-4 py-3 border-b border-border">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Batches ({batches.length})
          </span>
        </div>
        {batches.map(batch => (
          <BatchRow key={batch.index} batch={batch} />
        ))}
      </CardContent>
    </Card>
  )
})
