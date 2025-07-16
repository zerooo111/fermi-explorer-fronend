import React from 'react'
import { useRealTimeMetrics } from '@/hooks/useStatus'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChainStatusProps {
  className?: string
  showPerformanceMetrics?: boolean
  enableRealTime?: boolean
  compact?: boolean
}

export function ChainStatus({
  className,
  showPerformanceMetrics = true,
  enableRealTime = true,
  compact = false,
}: ChainStatusProps) {
  const {
    metrics,
    tps,
    tickRate,
    avgTxPerTick,
    isLive,
    isRealTime,
    trends,
    lastUpdated,
  } = useRealTimeMetrics()

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A'
    return num.toLocaleString()
  }

  const formatDecimal = (num: number | undefined, decimals = 2) => {
    if (num === undefined) return 'N/A'
    return num.toFixed(decimals)
  }

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing' | undefined) => {
    switch (trend) {
      case 'increasing':
        return '📈'
      case 'decreasing':
        return '📉'
      case 'stable':
      default:
        return '➖'
    }
  }

  const getStatusColor = (isLive: boolean) => {
    return isLive ? 'text-green-600' : 'text-yellow-600'
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 text-sm', className)}>
        <div className="flex items-center gap-1">
          <div className={cn('w-2 h-2 rounded-full', isLive ? 'bg-green-500' : 'bg-yellow-500')} />
          <span className={getStatusColor(isLive)}>
            {isLive ? 'LIVE' : 'DELAYED'}
          </span>
        </div>
        <span>Height: {formatNumber(metrics?.chainHeight)}</span>
        <span>TX: {formatNumber(metrics?.totalTransactions)}</span>
        {showPerformanceMetrics && (
          <span>TPS: {formatDecimal(tps)}</span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chain Status</h3>
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', isLive ? 'bg-green-500' : 'bg-yellow-500')} />
          <span className={cn('text-sm font-medium', getStatusColor(isLive))}>
            {isLive ? '🟢 LIVE' : '🟡 DELAYED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Chain Height</div>
          <div className="text-2xl font-bold">{formatNumber(metrics?.chainHeight)}</div>
          <div className="text-xs text-gray-500">Latest Tick: #{metrics?.latestTick}</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
          <div className="text-2xl font-bold">{formatNumber(metrics?.totalTransactions)}</div>
          <div className="text-xs text-gray-500">All-time processed</div>
        </div>

        {showPerformanceMetrics && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Performance</div>
            <div className="text-2xl font-bold">{formatDecimal(tps)} TPS</div>
            <div className="text-xs text-gray-500">
              {formatDecimal(tickRate)} ticks/sec
            </div>
          </div>
        )}
      </div>

      {showPerformanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Transaction Rate</div>
              <span className="text-lg">{getTrendIcon(trends?.transactions)}</span>
            </div>
            <div className="text-lg font-semibold">
              {formatDecimal(tps)} tx/sec
            </div>
            <div className="text-xs text-gray-500">
              Avg {formatDecimal(avgTxPerTick)} tx/tick
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tick Rate</div>
              <span className="text-lg">{getTrendIcon(trends?.ticks)}</span>
            </div>
            <div className="text-lg font-semibold">
              {formatDecimal(tickRate)} ticks/sec
            </div>
            <div className="text-xs text-gray-500">
              {isRealTime ? 'Real-time' : 'Cached'}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {enableRealTime && isRealTime ? 'Auto-updating' : 'Manual refresh'}
        </span>
        <span>
          {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Never updated'}
        </span>
      </div>
    </div>
  )
}

export default ChainStatus