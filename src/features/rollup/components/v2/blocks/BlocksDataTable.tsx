import { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useBlocks } from '@/features/rollup/api/hooks'
import type { Block } from '@/features/rollup/types/api'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Card, Badge, Skeleton,
} from '@/shared/components/ui'
import { EmptyState, HashDisplay } from '@/features/continuum/components/v2/shared'

function formatStateRoot(stateRoot: number[]): string {
  return '0x' + stateRoot.map(b => b.toString(16).padStart(2, '0')).join('')
}

function formatTimestamp(unixSeconds: number): string {
  const seconds = Math.floor(Date.now() / 1000 - unixSeconds)
  if (seconds < 0) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const BlockCard = memo(function BlockCard({ block }: { block: Block }) {
  return (
    <Link to="/execution/blocks/$height" params={{ height: String(block.height) }}>
      <Card variant="interactive" className="p-4 gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-medium text-foreground">
            #{block.height.toLocaleString()}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatTimestamp(block.produced_at)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Transactions</span>
          <Badge variant={block.transaction_ids.length > 0 ? 'success' : 'muted'}>
            {block.transaction_ids.length}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Batches</span>
          <span className="font-mono text-xs">{block.batch_summaries.length}</span>
        </div>
      </Card>
    </Link>
  )
})

interface BlocksDataTableProps {
  limit?: number
  offset?: number
}

export const BlocksDataTable = memo(function BlocksDataTable({
  limit = 20,
  offset = 0,
}: BlocksDataTableProps) {
  const { data, isLoading } = useBlocks(limit, offset)

  const blocks = useMemo(() => data?.blocks ?? [], [data])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (blocks.length === 0) {
    return <EmptyState message="No blocks found" description="Waiting for new blocks from the rollup" />
  }

  return (
    <div aria-live="polite">
      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-2">
        {blocks.map(block => (
          <BlockCard key={block.height} block={block} />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Height</TableHead>
              <TableHead>State Root</TableHead>
              <TableHead>Txns</TableHead>
              <TableHead>Batches</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Cancels</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map(block => (
              <TableRow key={block.height}>
                <TableCell>
                  <Link
                    to="/execution/blocks/$height"
                    params={{ height: String(block.height) }}
                    className="font-mono text-xs hover:underline hover:text-foreground"
                  >
                    #{block.height.toLocaleString()}
                  </Link>
                </TableCell>
                <TableCell>
                  <HashDisplay hash={formatStateRoot(block.state_root)} />
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{block.transaction_ids.length}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{block.batch_summaries.length}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{block.total_orders}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{block.total_cancels}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatTimestamp(block.produced_at)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})
