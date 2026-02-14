import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ChainMetrics } from '@/features/continuum/components/v2/metrics'
import { TicksDataTable } from '@/features/continuum/components/v2/ticks'
import { useContinuumRecentTransactions } from '@/features/continuum/api/hooks'
import type { ContinuumRecentTransactionsResponse } from '@/shared/types/shared/api'
import {
  Card, Badge, TransactionTableSkeleton,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button,
} from '@/shared/components/ui'
import { HashDisplay, TimestampDisplay, EmptyState } from '@/features/continuum/components/v2/shared'

export default function ContinuumHomepage() {
  const { data: rawTxData, isLoading: txLoading } = useContinuumRecentTransactions(10)
  const txData = rawTxData as ContinuumRecentTransactionsResponse | undefined
  const transactions = useMemo(() => txData?.transactions ?? [], [txData])

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-8">
      {/* Chain Metrics */}
      <ChainMetrics />

      {/* Recent Ticks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-sm uppercase tracking-[0.15em] text-foreground font-medium">
            Recent Ticks
          </h2>
          <a href="/sequencing/ticks">
            <Button variant="ghost" className="text-xs font-mono">View All</Button>
          </a>
        </div>
        <TicksDataTable limit={10} />
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-sm uppercase tracking-[0.15em] text-foreground font-medium">
            Recent Transactions
          </h2>
        </div>
        {txLoading ? (
          <TransactionTableSkeleton rows={6} />
        ) : transactions.length === 0 ? (
          <EmptyState message="No transactions found" />
        ) : (
          <div aria-live="polite">
            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-2">
              {transactions.map(tx => (
                <Link key={tx.tx_hash} to="/sequencing/tx/$transactionId" params={{ transactionId: tx.tx_hash }}>
                  <Card variant="interactive" className="p-4 gap-2">
                    <div className="flex items-center justify-between">
                      <HashDisplay hash={tx.tx_hash} />
                      <TimestampDisplay timestamp={tx.timestamp} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tick #{tx.tick_number}</span>
                      <Badge variant="muted">Seq #{tx.sequence_number}</Badge>
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
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Tick #</TableHead>
                    <TableHead>Seq #</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(tx => (
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
                        <Link
                          to="/sequencing/tick/$tickId"
                          params={{ tickId: String(tx.tick_number) }}
                          className="font-mono text-xs hover:underline"
                        >
                          #{tx.tick_number.toLocaleString()}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{tx.sequence_number}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <TimestampDisplay timestamp={tx.timestamp} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
