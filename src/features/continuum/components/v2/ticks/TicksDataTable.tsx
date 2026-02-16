import { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useRecentTicks } from '@/features/continuum/api/hooks'
import type { RecentTicksResponse } from '@/shared/types/shared/api'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  TicksTableSkeleton,
} from '@/shared/components/ui'
import { TimestampDisplay, EmptyState } from '../shared'
import { Cube } from '@phosphor-icons/react'
import { TickCard } from './TickCard'

interface TicksDataTableProps {
  limit?: number
}

export const TicksDataTable = memo(function TicksDataTable({ limit = 20 }: TicksDataTableProps) {
  const { data: rawData, isLoading } = useRecentTicks(limit)
  const data = rawData as RecentTicksResponse | undefined

  const ticks = useMemo(() => data?.ticks ?? [], [data])

  if (isLoading) {
    return <TicksTableSkeleton rows={limit > 10 ? 10 : limit} />
  }

  if (ticks.length === 0) {
    return <EmptyState message="No ticks found" description="Waiting for new ticks from the sequencer" />
  }

  return (
    <div aria-live="polite">
      {/* Mobile: card layout */}
      <div className="md:hidden flex flex-col gap-2">
        {ticks.map(tick => (
          <TickCard key={tick.tick_number} tick={tick} />
        ))}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tick #</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ticks.map(tick => (
              <TableRow key={tick.tick_number}>
                <TableCell>
                  <Link
                    to="/sequencing/tick/$tickId"
                    params={{ tickId: String(tick.tick_number) }}
                    className="inline-flex items-center gap-1.5 font-mono text-xs hover:underline hover:text-foreground"
                  >
                    <Cube weight="duotone" className="w-3.5 h-3.5 text-accent" />
                    #{tick.tick_number.toLocaleString()}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{tick.transaction_count}</span>
                </TableCell>
                <TableCell className="text-right">
                  <TimestampDisplay timestamp={tick.timestamp} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})
