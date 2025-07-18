import NumberFlow from '@number-flow/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { StatusResponse } from '@/api/types'
import { apiClient } from '@/api/client'
import { cn } from '@/lib/utils'
import { RecentTicks } from '@/components/RecentTicks'
import { LiveTicksTable } from '@/components/LiveTicksTable'
import { useTickStream } from '@/hooks'

interface ChainStatusProps {
  className?: string
}

const REFETCH_INTERVAL = 500
const TREND_DIRECTION = 1

export function ChainStatus({ className }: ChainStatusProps) {
  const [prevUpdate, setPrevUpdate] = useState<{
    tick: number
    timestamp: number
  } | null>(null)
  const [ticksPerSecond, setTicksPerSecond] = useState<number>(0)

  const { ticks } = useTickStream({
    displayLimit: 10,
    throttleMs: 200,
  })

  const { data: metrics } = useQuery({
    queryKey: ['chain-status'],
    queryFn: async () => {
      const res = await apiClient.get<StatusResponse>('/api/v1/status')
      const now = Date.now()

      if (prevUpdate && res.latest_tick > prevUpdate.tick) {
        const tickDiff = res.latest_tick - prevUpdate.tick
        const timeDiff = (now - prevUpdate.timestamp) / 1000 // Convert to seconds

        if (timeDiff > 0) {
          const tps = tickDiff / timeDiff
          setTicksPerSecond(Math.round(tps))
        }
      }

      setPrevUpdate({
        tick: res.latest_tick,
        timestamp: now,
      })

      return res
    },
    staleTime: 0,
    gcTime: 0,
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  })

  return (
    <div className={cn('flex gap-5', className)}>
      <div className="grid grid-rows-3 divide-y divide-zinc-700 border border-zinc-700 flex-1/3">
        <div className="bg-zinc-900 p-4 pb-0">
          <div className="text-sm font-medium text-zinc-400 font-mono tracking-wider ">
            CHAIN HEIGHT
          </div>
          <div className="text-3xl font-bold text-zinc-100 font-mono">
            <NumberFlow
              value={metrics?.chain_height ?? 0}
              trend={TREND_DIRECTION}
            />
          </div>
        </div>

        <div className=" bg-zinc-900 p-4 pb-0">
          <div className="text-sm font-medium text-zinc-400 font-mono tracking-wider ">
            TOTAL TRANSACTIONS
          </div>
          <div className="text-3xl font-bold text-zinc-100 font-mono">
            <NumberFlow
              value={metrics?.total_transactions ?? 0}
              trend={TREND_DIRECTION}
            />
            {/* {metrics?.total_transactions} */}
          </div>
        </div>

        <div className=" bg-zinc-900 p-4 pb-0">
          <div className="text-sm font-medium text-zinc-400 font-mono tracking-wider ">
            TICKS PER SECOND
          </div>
          <div className="text-3xl font-bold text-zinc-100 font-mono">
            <NumberFlow value={ticksPerSecond} trend={TREND_DIRECTION} />
          </div>
        </div>
      </div>
      <div className="flex">
        <RecentTicks limit={10} />
        <LiveTicksTable ticks={ticks} />
      </div>
    </div>
  )
}

export default ChainStatus
