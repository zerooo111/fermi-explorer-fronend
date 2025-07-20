import React from 'react'
import { differenceInMilliseconds } from 'date-fns'
import { Link } from '@tanstack/react-router'
import type { Tick, TickSummary } from '@fermi/shared-types/api'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import {
  calculateAgeInMilliseconds,
  toBN,
  toSafeNumber,
} from '@fermi/shared-utils/big-numbers'

interface TicksTableProps {
  ticks: Array<Tick | TickSummary>
  className?: string
}

export function TicksTable({ ticks }: TicksTableProps) {
  const TickRow = React.memo(
    ({ tick }: { tick: Tick | TickSummary }) => {
      let millisecondsAgo: number

      try {
        // Use bn.js for safe timestamp handling - timestamps are in microseconds
        millisecondsAgo = calculateAgeInMilliseconds(tick.timestamp)
      } catch (error) {
        console.warn('Error calculating age with big numbers:', error)
        // Fallback to original calculation
        const tickDate = new Date(tick.timestamp / 1000)
        millisecondsAgo = differenceInMilliseconds(new Date(), tickDate)
      }

      return (
        <TableRow key={tick.tick_number} className="hover:bg-zinc-900/50 h-10">
          <TableCell className="font-mono font-medium text-zinc-300 tabular-nums text-sm text-left min-w-32">
            <Link
              to="/tick/$tickId"
              params={{ tickId: tick.tick_number.toString() }}
              className="hover:underline underline-offset-2 hover:text-zinc-100"
            >
              {toSafeNumber(toBN(tick.tick_number))}
            </Link>
          </TableCell>
          <TableCell className="text-zinc-400 text-sm text-left font-mono">
            <div>{toSafeNumber(toBN(tick.transaction_count))} txns</div>
          </TableCell>

          <TableCell className="text-zinc-600 font-mono text-sm text-right min-w-36 whitespace-nowrap">
            {millisecondsAgo} ms ago
          </TableCell>
        </TableRow>
      )
    },
    (prevProps, nextProps) =>
      prevProps.tick.tick_number === nextProps.tick.tick_number,
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
    <Table className="w-full">
      <TableBody>
        {ticks.map((tick) => (
          <TickRow key={tick.tick_number} tick={tick} />
        ))}
      </TableBody>
    </Table>
  )

  return tableContent
}
