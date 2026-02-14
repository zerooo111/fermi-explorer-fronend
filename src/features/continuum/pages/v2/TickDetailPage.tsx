import { useParams, Link } from '@tanstack/react-router'
import { useContinuumTick } from '@/features/continuum/api/hooks'
import type { Tick } from '@/shared/types/shared/api'
import {
  Table, TableBody, TableCell, TableRow, TableHeader, TableHead,
  Card, CardContent, Alert, AlertDescription, PageSkeleton, TableSkeleton,
  Badge, Button,
} from '@/shared/components/ui'
import { Breadcrumbs, HashDisplay, TimestampDisplay, StatusBadge, EmptyState } from '@/features/continuum/components/v2/shared'

export default function TickDetailPage() {
  const { tickId } = useParams({ from: '/sequencing/tick/$tickId' })
  const tickNumber = parseInt(tickId, 10)
  const { data: rawTick, isLoading, isError, error } = useContinuumTick(tickNumber)
  const tick = rawTick as (Tick & { transactions?: Array<{ tx_hash: string; tx_id: string; sequence_number: number; nonce: number }> }) | undefined

  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-1/3">
        <TableSkeleton rows={8} />
      </PageSkeleton>
    )
  }

  if (isError) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <Alert variant="error">
          <AlertDescription>
            Error loading tick: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
        <Link to="/sequencing" className="mt-4 inline-block">
          <Button variant="default">Return to home</Button>
        </Link>
      </div>
    )
  }

  if (!tick?.tick_number) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <EmptyState message="Tick not found" description="The requested tick does not exist or is not yet available." />
        <div className="flex justify-center mt-4">
          <Link to="/sequencing"><Button variant="default">Return to home</Button></Link>
        </div>
      </div>
    )
  }

  const infoRows = [
    { label: 'Tick Number', value: <span className="font-mono text-xs">#{tick.tick_number.toLocaleString()}</span> },
    { label: 'Status', value: <StatusBadge status={tick.status} /> },
    { label: 'Timestamp', value: <TimestampDisplay timestamp={tick.timestamp} /> },
    { label: 'Transactions', value: <Badge variant={tick.transaction_count > 0 ? 'success' : 'muted'}>{tick.transaction_count}</Badge> },
    { label: 'Batch Hash', value: <HashDisplay hash={tick.transaction_batch_hash} /> },
    ...(tick.vdf_proof ? [
      { label: 'VDF Iterations', value: <span className="font-mono text-xs">{tick.vdf_proof.iterations.toLocaleString()}</span> },
      { label: 'VDF Input', value: <code className="font-mono text-xs break-all">{tick.vdf_proof.input}</code> },
      { label: 'VDF Output', value: <code className="font-mono text-xs break-all">{tick.vdf_proof.output}</code> },
      { label: 'VDF Proof', value: <code className="font-mono text-xs break-all">{tick.vdf_proof.proof}</code> },
    ] : []),
    ...(tick.previous_output ? [
      { label: 'Previous Output', value: <code className="font-mono text-xs break-all">{tick.previous_output}</code> },
    ] : []),
  ]

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Breadcrumbs items={[
        { label: 'Sequencing', href: '/sequencing' },
        { label: 'Ticks', href: '/sequencing/ticks' },
        { label: `Tick #${tick.tick_number}` },
      ]} />

      <h1 className="text-lg sm:text-xl font-bold text-foreground">
        Tick #{tick.tick_number.toLocaleString()}
      </h1>

      <Card variant="default">
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {infoRows.map(row => (
                <TableRow key={row.label}>
                  <TableCell className="text-xs py-2.5 bg-secondary sm:text-sm font-mono whitespace-nowrap w-44">
                    {row.label}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transactions in this tick */}
      {tick.transactions && tick.transactions.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-foreground mb-4">
            Transactions ({tick.transactions.length})
          </h2>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-2">
            {tick.transactions.map(tx => (
              <Link key={tx.tx_hash} to="/sequencing/tx/$transactionId" params={{ transactionId: tx.tx_hash }}>
                <Card variant="interactive" className="p-4 gap-2">
                  <div className="flex items-center justify-between">
                    <HashDisplay hash={tx.tx_hash} />
                    <Badge variant="muted">Seq #{tx.sequence_number}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Card variant="default">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TX Hash</TableHead>
                      <TableHead>TX ID</TableHead>
                      <TableHead>Sequence #</TableHead>
                      <TableHead>Nonce</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tick.transactions.map(tx => (
                      <TableRow key={tx.tx_hash}>
                        <TableCell>
                          <Link
                            to="/sequencing/tx/$transactionId"
                            params={{ transactionId: tx.tx_hash }}
                            className="hover:underline"
                          >
                            <HashDisplay hash={tx.tx_hash} />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <code className="font-mono text-xs">
                            {tx.tx_id.length > 30 ? `${tx.tx_id.slice(0, 30)}...` : tx.tx_id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">{tx.sequence_number}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">{tx.nonce}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <div>
        <Link to="/sequencing">
          <Button variant="default">Return to home</Button>
        </Link>
      </div>
    </div>
  )
}
