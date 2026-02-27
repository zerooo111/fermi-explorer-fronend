import { memo, useRef, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Cube, Receipt, Lightning, Timer, Pulse } from '@phosphor-icons/react'
import type { StatusResponse } from '@/shared/types/api/health'
import { continuumRoutes } from '@/shared/lib/routes'
import { Stagger, StaggerItem } from '@/shared/components/ui'
import { MetricCard } from './MetricCard'

const REFETCH_INTERVAL = 500
const HISTORY_SIZE = 30

function useMetricHistory(value: number | undefined): number[] {
  const historyRef = useRef<number[]>([])
  const [history, setHistory] = useState<number[]>([])
  const lastRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (value == null || value === lastRef.current) return
    lastRef.current = value

    const next = [...historyRef.current, value]
    if (next.length > HISTORY_SIZE) next.shift()
    historyRef.current = next
    setHistory(next)
  }, [value])

  return history
}

export const ChainMetrics = memo(function ChainMetrics() {

  const { data: metrics, isLoading } = useQuery<StatusResponse>({
    queryKey: ['chain-status'],
    queryFn: async () => {
      const response = await axios.get<StatusResponse>(continuumRoutes.STATUS)
      return response.data
    },
    staleTime: 0,
    gcTime: 0,
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  })

  const tpsValue = metrics?.txn_per_second != null ? Math.round(metrics.txn_per_second) : undefined
  const tpsHistory = useMetricHistory(tpsValue)

  const ticksPerSecValue = metrics?.ticks_per_second ? Math.round(metrics.ticks_per_second) : undefined
  const tickTimeValue = metrics?.average_tick_time != null
    ? metrics.average_tick_time
    : metrics?.last_60_seconds?.mean_tick_time_micros

  const ticksPerSecHistory = useMetricHistory(ticksPerSecValue)
  const tickTimeHistory = useMetricHistory(tickTimeValue != null ? Math.round(tickTimeValue * 100) / 100 : undefined)

  return (
    <Stagger className="flex flex-col gap-4" aria-live="polite" aria-label="Chain metrics">
      <StaggerItem>
        <div className="grid grid-cols-2 divide-x divide-border border border-border">
          <MetricCard
            label="Chain Height"
            icon={Cube}
            value={metrics?.chain_height}
            isLoading={isLoading}
          />
          <MetricCard
            label="Total Txns"
            icon={Receipt}
            value={metrics?.total_transactions}
            isLoading={isLoading}
          />
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="grid grid-cols-3 divide-x divide-border border border-border">
          <MetricCard
            label="Txns/Sec"
            icon={Lightning}
            value={tpsValue}
            isLoading={isLoading}
            sparklineData={tpsHistory}
          />
          <MetricCard
            label="Ticks/Sec"
            icon={Pulse}
            value={ticksPerSecValue}
            isLoading={isLoading}
            sparklineData={ticksPerSecHistory}
          />
          <MetricCard
            label="Tick Time"
            icon={Timer}
            value={tickTimeValue}
            decimals={2}
            suffix={'\u00B5s'}
            isLoading={isLoading}
            sparklineData={tickTimeHistory}
          />
        </div>
      </StaggerItem>

    </Stagger>
  )
})
