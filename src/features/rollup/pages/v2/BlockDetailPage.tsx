import { Link, useParams } from '@tanstack/react-router'
import { useBlock } from '@/features/rollup/api/hooks'
import type { BlockWithDetails } from '@/features/rollup/types/api'
import { StateRootViewer, BatchSummaryView } from '@/features/rollup/components/v2/blocks'
import { MetricCard } from '@/features/continuum/components/v2/metrics'
import { Breadcrumbs, HashDisplay, EmptyState } from '@/features/continuum/components/v2/shared'
import {
  Alert, AlertDescription, PageSkeleton, TableSkeleton,
  Card, Badge, Button,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Stagger, StaggerItem,
} from '@/shared/components/ui'

export default function BlockDetailPage() {
  const { height } = useParams({ from: '/execution/blocks/$height' })
  const blockHeight = parseInt(height, 10)
  const { data: rawData, isLoading, error } = useBlock(blockHeight)
  const data = rawData as BlockWithDetails | undefined

  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-1/4">
        <TableSkeleton rows={10} />
      </PageSkeleton>
    )
  }

  if (error) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <Alert variant="error">
          <AlertDescription>Error loading block: {(error as Error).message}</AlertDescription>
        </Alert>
        <Link to="/execution/blocks" className="mt-4 inline-block">
          <Button variant="default">Return to blocks</Button>
        </Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <EmptyState message="Block not found" />
        <div className="flex justify-center mt-4">
          <Link to="/execution/blocks"><Button variant="default">Return to blocks</Button></Link>
        </div>
      </div>
    )
  }

  const block = data.block

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Breadcrumbs items={[
        { label: 'Execution', href: '/execution' },
        { label: 'Blocks', href: '/execution/blocks' },
        { label: `Block #${block.height}` },
      ]} />

      <h1 className="text-lg sm:text-xl font-bold text-foreground">
        Block #{block.height.toLocaleString()}
      </h1>

      {/* Stats */}
      <Stagger>
        <StaggerItem>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border border-border">
            <MetricCard label="Transactions" value={block.transaction_ids.length} />
            <MetricCard label="Orders" value={block.total_orders} />
            <MetricCard label="Cancels" value={block.total_cancels} />
            <MetricCard label="Batches" value={block.batch_summaries.length} />
          </div>
        </StaggerItem>
      </Stagger>

      {/* State Root */}
      <StateRootViewer current={block.state_root} />

      {/* Batches */}
      <BatchSummaryView batches={block.batch_summaries} />

      {/* Transactions */}
      {data.transactions.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-foreground mb-4">
            Transactions ({data.transactions.length})
          </h2>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-2">
            {data.transactions.map(tx => (
              <Link key={tx.id} to="/execution/transactions/$id" params={{ id: tx.id }}>
                <Card variant="interactive" className="p-4 gap-2">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-xs">{tx.id}</code>
                    <Badge variant={tx.kind === 'order' ? 'success' : 'warning'} className="text-[9px]">
                      {tx.kind}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{tx.side}</span>
                    <HashDisplay hash={tx.owner} prefixLength={8} suffixLength={8} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Link
                        to="/execution/transactions/$id"
                        params={{ id: tx.id }}
                        className="font-mono text-xs hover:underline hover:text-foreground"
                      >
                        {tx.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.kind === 'order' ? 'success' : 'warning'} className="text-[9px]">
                        {tx.kind}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{tx.side}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <HashDisplay hash={tx.owner} prefixLength={8} suffixLength={8} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {/* Events */}
      {data.events.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-foreground mb-4">
            Events ({data.events.length})
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Market ID</TableHead>
                <TableHead>Applied Orders</TableHead>
                <TableHead className="text-right">Batch Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.events.map(event => (
                <TableRow key={event.id}>
                  <TableCell>
                    <code className="font-mono text-xs">{event.id}</code>
                  </TableCell>
                  <TableCell>
                    <HashDisplay hash={event.market_id} prefixLength={8} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{event.applied_orders}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <HashDisplay hash={event.batch_hash} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  )
}
