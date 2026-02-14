import { memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Cube, Receipt, Lightning, Timer, Pulse } from '@phosphor-icons/react'
import type { StatusResponse } from '@/shared/types/api/health'
import { continuumRoutes } from '@/shared/lib/routes'
import { Stagger, StaggerItem } from '@/shared/components/ui'
import { MetricCard } from './MetricCard'

const REFETCH_INTERVAL = 500

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
            value={metrics?.txn_per_second ? Math.round(metrics.txn_per_second) : undefined}
            isLoading={isLoading}
          />
          <MetricCard
            label="Ticks/Sec"
            icon={Pulse}
            value={metrics?.ticks_per_second ? Math.round(metrics.ticks_per_second) : undefined}
            isLoading={isLoading}
          />
          <MetricCard
            label="Tick Time"
            icon={Timer}
            value={
              metrics?.average_tick_time != null
                ? metrics.average_tick_time
                : metrics?.last_60_seconds?.mean_tick_time_micros
            }
            decimals={1}
            suffix={'\u00B5s'}
            isLoading={isLoading}
          />
        </div>
      </StaggerItem>

    </Stagger>
  )
})
