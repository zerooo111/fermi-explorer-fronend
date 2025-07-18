import React from 'react'
import { differenceInMilliseconds } from 'date-fns'
import { Link } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Tick, TickSummary } from '@/api/types'
import { calculateTrend } from '@/lib/formatters'
import NumberFlow from '@number-flow/react'

interface TicksTableProps {
  ticks: Array<Tick | TickSummary>
  title: string
  showTransactions?: boolean
  showAge?: boolean
  useNumberFlow?: boolean
  className?: string
}

export function TicksTable({
  ticks,
  title,
  showTransactions = false,
  showAge = true,
  useNumberFlow = false,
  className = '',
}: TicksTableProps) {
  // Trend calculation for NumberFlow
  const trendCalculator = (oldValue: number, newValue: number) =>
    calculateTrend(oldValue, newValue)

  // Memoized TickRow component to prevent unnecessary re-renders
  const TickRow = React.memo(
    ({
      tick,
      showTransactions: showTx,

      showAge: showTickAge,
      useNumberFlow: useFlow,
    }: {
      tick: Tick | TickSummary
      showTransactions: boolean
      showBatchHash: boolean
      showAge: boolean
      useNumberFlow: boolean
    }) => {
      const tickDate = new Date(tick.timestamp / 1000) // Timestamp is already in milliseconds
      const millisecondsAgo = Date.now() - tickDate.getTime()

      return (
        <TableRow key={tick.tick_number} className="hover:bg-zinc-900/50">
          <TableCell className="font-mono font-medium text-zinc-300 text-sm text-left w-32">
            <Link
              to="/tick/$tickId"
              params={{ tickId: tick.tick_number.toString() }}
              className="hover:underline underline-offset-2 hover:text-zinc-100"
            >
              {tick.tick_number}
            </Link>
          </TableCell>
          <TableCell className="text-zinc-400 text-sm text-left">
            <div className="space-y-0.5">
              <div>
                {useFlow ? (
                  <NumberFlow
                    value={tick.transaction_count}
                    trend={trendCalculator}
                  />
                ) : (
                  tick.transaction_count
                )}{' '}
                txn
                {tick.transaction_count !== 1 ? 's' : ''}
              </div>
              {showTx &&
                'transactions' in tick &&
                tick.transactions.length > 0 && (
                  <div className="text-xs text-zinc-500 space-y-0.5">
                    {tick.transactions.slice(0, 3).map((tx: any) => (
                      <div key={tx.tx_id} className="font-mono">
                        {tx.tx_id.substring(0, 8)}...
                      </div>
                    ))}
                    {tick.transactions.length > 3 && (
                      <div>+{tick.transactions.length - 3} more</div>
                    )}
                  </div>
                )}
            </div>
          </TableCell>

          {showTickAge && (
            <TableCell className="text-zinc-600 font-mono text-sm text-right w-28">
              {/* {millisecondsAgo} ms ago */}
              {tick.timestamp}
            </TableCell>
          )}
        </TableRow>
      )
    },
    (prevProps, nextProps) => {
      // Only re-render if tick number or display options change
      return (
        prevProps.tick.tick_number === nextProps.tick.tick_number &&
        prevProps.showTransactions === nextProps.showTransactions &&
        prevProps.showAge === nextProps.showAge &&
        prevProps.useNumberFlow === nextProps.useNumberFlow
      )
    },
  )

  if (ticks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-zinc-500 font-mono tracking-wide">
          NO TICKS AVAILABLE
        </p>
      </div>
    )
  }

  const tableContent = (
    <Table className="w-fit">
      <TableHeader>
        <TableRow>
          <TableHead className="w-48 font-bold text-sm text-zinc-300 text-left">
            {title}
          </TableHead>
          <TableHead className="text-left"></TableHead>
          {showAge && <TableHead className="w-28 text-right"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ticks.map((tick) => (
          <TickRow
            key={tick.tick_number}
            tick={tick}
            showTransactions={showTransactions}
            showAge={showAge}
            useNumberFlow={useNumberFlow}
          />
        ))}
      </TableBody>
    </Table>
  )

  return tableContent
}
