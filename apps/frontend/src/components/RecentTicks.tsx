import { useQuery } from '@tanstack/react-query'
import { TicksTable } from './TicksTable'
import type { RecentTicksResponse } from '@/api/types'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import { format } from 'date-fns'
import NumberFlow from '@number-flow/react'

interface RecentTicksProps {
  limit?: number
  showAge?: boolean
}

export function RecentTicks({ limit = 50 }: RecentTicksProps) {
  const { data, dataUpdatedAt } = useQuery<
    RecentTicksResponse,
    Error
  >({
    queryKey: queryKeys.ticks.recent({ limit }),
    queryFn: () =>
      apiClient.get<RecentTicksResponse>(`/api/v1/ticks/recent?limit=${limit}`),
    refetchInterval: 500,
    staleTime: 0,
    gcTime: 0,
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase">
        Recent Ticks
      </h3>
      <TicksTable ticks={data?.ticks ?? []} />
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Last updated</span>
        <span className="text-sm text-zinc-400 font-mono font-medium">
          {format(dataUpdatedAt, 'MM/dd/yyyy')}
          <NumberFlow value={Number(format(dataUpdatedAt, 'HH'))} trend={1} />:
          <NumberFlow value={Number(format(dataUpdatedAt, 'mm'))} trend={1} />:
          <NumberFlow value={Number(format(dataUpdatedAt, 'ss'))} trend={1} />.
          <NumberFlow value={Number(format(dataUpdatedAt, 'SSS'))} trend={1} />
        </span>
      </div>
    </div>
  )
}
