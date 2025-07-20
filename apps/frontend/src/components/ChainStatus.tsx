import NumberFlow from '@number-flow/react'
import { useQuery } from '@tanstack/react-query'
import type { StatusResponse } from '@/api/types'
import { toBN, toSafeNumber } from '@/lib/bigNumbers'

const REFETCH_INTERVAL = 500
const TREND_DIRECTION = 1

const MetricCard = ({
  title,
  value,
  trend,
}: {
  title: string
  value: number
  trend: number
}) => {
  return (
    <div className="bg-zinc-900 p-4 pb-0 flex-1">
      <div className="text-sm font-medium text-zinc-400 font-mono tracking-wider ">
        {title}
      </div>
      <div className="text-3xl font-bold text-zinc-100 font-mono">
        <NumberFlow value={value} trend={trend} />
      </div>
    </div>
  )
}

export function ChainStatus() {
  const { data: metrics } = useQuery({
    queryKey: ['chain-status'],
    queryFn: async () => {
      const res = (await fetch('http://localhost:3001/api/v1/status').then(
        (r) => r.json(),
      )) as StatusResponse
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
    <div className="flex border divide-x divide-zinc-700 border-zinc-700">
      <MetricCard
        title="CHAIN HEIGHT"
        value={toSafeNumber(toBN(metrics?.current_tick ?? '0'))}
        trend={TREND_DIRECTION}
      />

      <MetricCard
        title="TOTAL TRANSACTIONS"
        value={toSafeNumber(toBN(metrics?.total_transactions ?? '0'))}
        trend={TREND_DIRECTION}
      />

      <MetricCard
        title="TXS PER SECOND"
        value={Math.round(metrics?.transactions_per_second ?? 0)}
        trend={TREND_DIRECTION}
      />
    </div>
  )
}

export default ChainStatus
