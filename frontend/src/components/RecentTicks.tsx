import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { cacheConfig, queryKeys } from '@/api/queryKeys'
import type { RecentTicksResponse, TickSummary } from '@/api/types'
import { differenceInSeconds } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface RecentTicksProps {
  limit?: number
  showAge?: boolean
}

export function RecentTicks({ limit = 50, showAge = true }: RecentTicksProps) {
  const { data, isLoading, isError, error } = useQuery<
    RecentTicksResponse,
    Error
  >({
    queryKey: queryKeys.ticks.recent({ limit }),
    queryFn: () =>
      apiClient.get<RecentTicksResponse>(`/api/v1/ticks/recent?limit=${limit}`),
    refetchInterval: cacheConfig.recentTicks.refetchInterval,
    staleTime: cacheConfig.recentTicks.staleTime,
    gcTime: cacheConfig.recentTicks.cacheTime,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Recent Ticks</h3>
        <div className="text-sm text-gray-500">Loading recent ticks...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Recent Ticks</h3>
        <div className="text-sm text-red-500">
          Error loading ticks: {error.message || 'Unknown error'}
        </div>
      </div>
    )
  }

  if (!data?.ticks || data.ticks.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Recent Ticks</h3>
        <div className="text-sm text-gray-500">No ticks found</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Ticks</h3>
        <span className="text-sm text-gray-500">
          {data.total} tick{data.total !== 1 ? 's' : ''}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tick #</TableHead>
            <TableHead>Transactions</TableHead>
            {showAge && <TableHead>Age</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.ticks.map((tick: TickSummary) => {
            // Convert microseconds timestamp to milliseconds for JavaScript Date
            const tickDate = new Date(tick.timestamp / 1000)
            const secondsAgo = differenceInSeconds(new Date(), tickDate)

            return (
              <TableRow key={tick.tick_number}>
                <TableCell className="font-mono font-medium">
                  #{tick.tick_number}
                </TableCell>
                <TableCell>
                  {tick.transaction_count} transaction
                  {tick.transaction_count !== 1 ? 's' : ''}
                </TableCell>
                {showAge && (
                  <TableCell className="text-muted-foreground">
                    {secondsAgo}s ago
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
