import { useQuery } from '@tanstack/react-query'
import { TicksTable } from './TicksTable'
import type { RecentTicksResponse } from '@/api/types'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'

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
    refetchInterval: 500,
    staleTime: 0,
    gcTime: 0,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
          <h3 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase">
            Recent Ticks
          </h3>
          <span className="text-sm text-zinc-500 font-mono tracking-wide">
            LOADING...
          </span>
        </div>
        <div className="text-sm text-zinc-500 font-mono tracking-wide py-8 text-center">
          LOADING RECENT TICKS...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
          <h3 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase">
            Recent Ticks
          </h3>
          <span className="text-sm text-zinc-500 font-mono tracking-wide">
            ERROR
          </span>
        </div>
        <div className="border border-red-700 bg-red-950 p-4">
          <div className="text-sm text-red-400 font-mono">
            ERROR LOADING TICKS: {error.message || 'UNKNOWN ERROR'}
          </div>
        </div>
      </div>
    )
  }

  if (!data?.ticks || data.ticks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
          <h3 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase">
            Recent Ticks
          </h3>
          <span className="text-sm text-zinc-500 font-mono tracking-wide">
            0 TICKS
          </span>
        </div>
        <div className="text-sm text-zinc-500 font-mono tracking-wide py-8 text-center">
          NO TICKS FOUND
        </div>
      </div>
    )
  }

  return (
    <TicksTable
      ticks={data.ticks}
      title="Recent Ticks"
      showAge={showAge}
      useNumberFlow={true}
    />
  )
}
