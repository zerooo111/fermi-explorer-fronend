import { memo, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { StatusResponse } from '@/shared/types/api/health'
import { continuumRoutes } from '@/shared/lib/routes'
import { Stagger, StaggerItem, Button } from '@/shared/components/ui'
import { MetricCard } from './MetricCard'

const REFETCH_INTERVAL = 500

export const ChainMetrics = memo(function ChainMetrics() {
  const [showMore, setShowMore] = useState(false)
  const toggleMore = useCallback(() => setShowMore(v => !v), [])

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
            value={metrics?.chain_height}
            isLoading={isLoading}
          />
          <MetricCard
            label="Total Txns"
            value={metrics?.total_transactions}
            isLoading={isLoading}
          />
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="grid grid-cols-3 divide-x divide-border border border-border">
          <MetricCard
            label="Txns/Sec"
            value={metrics?.txn_per_second ? Math.round(metrics.txn_per_second) : undefined}
            isLoading={isLoading}
          />
          <MetricCard
            label="Ticks/Sec"
            value={metrics?.ticks_per_second ? Math.round(metrics.ticks_per_second) : undefined}
            isLoading={isLoading}
          />
          <MetricCard
            label="Tick Time"
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

      {showMore && (
        <StaggerItem>
          <div className="grid grid-cols-2 divide-x divide-border border border-border">
            <MetricCard
              label="Uptime"
              value={metrics?.uptime_seconds ? Math.floor(metrics.uptime_seconds / 3600) : undefined}
              suffix="hrs"
              isLoading={isLoading}
            />
            <MetricCard
              label="Status"
              value={0}
              isLoading={isLoading}
            />
          </div>
        </StaggerItem>
      )}

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={toggleMore}
          className="text-xs font-mono gap-1"
        >
          {showMore ? (
            <>Less <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>More <ChevronDown className="w-3 h-3" /></>
          )}
        </Button>
      </div>
    </Stagger>
  )
})
