import { TicksTable } from './TicksTable'
import type { Tick } from '@/api/types'

interface LiveTicksTableProps {
  ticks: Array<Tick>
  showTransactions?: boolean
}

export function LiveTicksTable({
  ticks,
  showTransactions = false,
}: LiveTicksTableProps) {
  return (
    <TicksTable
      ticks={ticks}
      title="Live Ticks"
      showTransactions={showTransactions}
      showAge={true}
      useNumberFlow={false}
    />
  )
}
