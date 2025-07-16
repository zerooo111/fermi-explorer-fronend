/**
 * Status Hook for Continuum Sequencer
 * 
 * Provides sequencer status and metrics with real-time updates,
 * performance monitoring, and trend analysis.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys, cacheConfig, retryConfig } from '../api/queryKeys';
import type { StatusResponse, QueryOptions } from '../api/types';
import React from 'react';

/**
 * Options for status hook
 */
export interface UseStatusOptions extends QueryOptions {
  /**
   * Enable real-time polling for status updates
   */
  enableRealTime?: boolean;
  
  /**
   * Polling interval in milliseconds (default: 30 seconds)
   */
  pollingInterval?: number;
  
  /**
   * Enable performance tracking
   */
  trackPerformance?: boolean;
  
  /**
   * Callback when status updates
   */
  onStatusUpdate?: (status: StatusResponse) => void;
  
  /**
   * Callback when significant metrics change
   */
  onMetricsChange?: (metrics: {
    chainHeight: number;
    totalTransactions: number;
    heightChange: number;
    transactionChange: number;
  }) => void;
}

/**
 * Performance metrics calculated from status updates
 */
export interface PerformanceMetrics {
  /**
   * Estimated transactions per second over the last polling interval
   */
  transactionsPerSecond: number;
  
  /**
   * Estimated ticks per second over the last polling interval
   */
  ticksPerSecond: number;
  
  /**
   * Average transactions per tick
   */
  averageTransactionsPerTick: number;
  
  /**
   * Time since last update
   */
  timeSinceLastUpdate: number;
  
  /**
   * Trend indicators
   */
  trends: {
    transactions: 'increasing' | 'stable' | 'decreasing';
    ticks: 'increasing' | 'stable' | 'decreasing';
  };
}

/**
 * Hook for monitoring sequencer status and metrics
 * 
 * @param options Configuration options for status monitoring
 * @returns Query result with status data, metrics, and performance indicators
 * 
 * @example
 * ```tsx
 * function StatusDashboard() {
 *   const { 
 *     data, 
 *     metrics, 
 *     isRealTime,
 *     performance 
 *   } = useStatus({
 *     enableRealTime: true,
 *     trackPerformance: true,
 *     onMetricsChange: (metrics) => {
 *       if (metrics.transactionChange > 1000) {
 *         toast.info(`${metrics.transactionChange} new transactions`);
 *       }
 *     }
 *   });
 * 
 *   return (
 *     <div className="status-dashboard">
 *       <StatusCard title="Chain Height" value={data?.chain_height} />
 *       <StatusCard title="Total Transactions" value={data?.total_transactions} />
 *       <StatusCard title="TPS" value={performance?.transactionsPerSecond} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useStatus(options: UseStatusOptions = {}) {
  const {
    enableRealTime = false,
    pollingInterval = 30000,
    trackPerformance = false,
    onStatusUpdate,
    onMetricsChange,
    staleTime = cacheConfig.status.staleTime,
    retry = retryConfig.status.retry,
    ...queryOptions
  } = options;

  // Track previous status for performance calculations
  const [previousStatus, setPreviousStatus] = React.useState<StatusResponse | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = React.useState<number>(Date.now());
  const [performanceHistory, setPerformanceHistory] = React.useState<PerformanceMetrics[]>([]);

  const query = useQuery<StatusResponse, Error>({
    queryKey: queryKeys.status.current(),
    queryFn: () => apiClient.get<StatusResponse>('/api/v1/status'),
    staleTime,
    gcTime: cacheConfig.status.cacheTime,
    retry,
    retryDelay: retryConfig.status.retryDelay,
    refetchInterval: enableRealTime ? pollingInterval : false,
    refetchIntervalInBackground: enableRealTime,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...queryOptions,
  } as UseQueryOptions<StatusResponse, Error>);

  // Calculate performance metrics
  const performanceMetrics = React.useMemo((): PerformanceMetrics | null => {
    if (!trackPerformance || !query.data || !previousStatus) {
      return null;
    }

    const currentTime = Date.now();
    const timeDiff = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
    
    if (timeDiff <= 0) return null;

    const heightChange = query.data.chain_height - previousStatus.chain_height;
    const transactionChange = query.data.total_transactions - previousStatus.total_transactions;

    const ticksPerSecond = heightChange / timeDiff;
    const transactionsPerSecond = transactionChange / timeDiff;
    const averageTransactionsPerTick = heightChange > 0 ? transactionChange / heightChange : 0;

    // Determine trends based on recent history
    const recentHistory = performanceHistory.slice(-5); // Last 5 measurements
    const transactionTrend = determineTrend(recentHistory.map(h => h.transactionsPerSecond).concat(transactionsPerSecond));
    const tickTrend = determineTrend(recentHistory.map(h => h.ticksPerSecond).concat(ticksPerSecond));

    return {
      transactionsPerSecond: Math.max(0, transactionsPerSecond),
      ticksPerSecond: Math.max(0, ticksPerSecond),
      averageTransactionsPerTick: Math.max(0, averageTransactionsPerTick),
      timeSinceLastUpdate: timeDiff,
      trends: {
        transactions: transactionTrend,
        ticks: tickTrend,
      },
    };
  }, [query.data, previousStatus, lastUpdateTime, trackPerformance, performanceHistory]);

  // Update performance history
  React.useEffect(() => {
    if (performanceMetrics && trackPerformance) {
      setPerformanceHistory(prev => {
        const newHistory = [...prev, performanceMetrics];
        // Keep only last 20 measurements to prevent memory bloat
        return newHistory.slice(-20);
      });
    }
  }, [performanceMetrics, trackPerformance]);

  // Handle status updates
  React.useEffect(() => {
    if (query.data) {
      // Call status update callback
      if (onStatusUpdate) {
        onStatusUpdate(query.data);
      }

      // Call metrics change callback
      if (onMetricsChange && previousStatus) {
        const heightChange = query.data.chain_height - previousStatus.chain_height;
        const transactionChange = query.data.total_transactions - previousStatus.total_transactions;
        
        if (heightChange > 0 || transactionChange > 0) {
          onMetricsChange({
            chainHeight: query.data.chain_height,
            totalTransactions: query.data.total_transactions,
            heightChange,
            transactionChange,
          });
        }
      }

      // Update previous status for next comparison
      setPreviousStatus(query.data);
      setLastUpdateTime(Date.now());
    }
  }, [query.data, onStatusUpdate, onMetricsChange, previousStatus]);

  return {
    // Query data
    data: query.data,
    error: query.error,
    
    // Loading states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    
    // Status flags
    isSuccess: query.isSuccess,
    isError: query.isError,
    
    // Real-time status
    isRealTime: enableRealTime,
    isPolling: enableRealTime && !query.isPaused,
    
    // Metrics
    metrics: query.data ? {
      chainHeight: query.data.chain_height,
      totalTransactions: query.data.total_transactions,
      latestTick: query.data.latest_tick,
      status: query.data.status,
    } : null,
    
    // Performance data
    performance: performanceMetrics,
    performanceHistory: trackPerformance ? performanceHistory : [],
    
    // Change indicators
    previousMetrics: previousStatus ? {
      chainHeight: previousStatus.chain_height,
      totalTransactions: previousStatus.total_transactions,
      latestTick: previousStatus.latest_tick,
    } : null,
    
    // Control functions
    refetch: query.refetch,
    
    // Query metadata
    lastUpdated: query.dataUpdatedAt,
    failureCount: query.failureCount,
  };
}

/**
 * Helper function to determine trend from array of values
 */
function determineTrend(values: number[]): 'increasing' | 'stable' | 'decreasing' {
  if (values.length < 2) return 'stable';
  
  const recentValues = values.slice(-3); // Look at last 3 values
  if (recentValues.length < 2) return 'stable';
  
  let increases = 0;
  let decreases = 0;
  
  for (let i = 1; i < recentValues.length; i++) {
    const diff = recentValues[i] - recentValues[i - 1];
    if (Math.abs(diff) < 0.1) continue; // Ignore tiny changes
    
    if (diff > 0) increases++;
    else decreases++;
  }
  
  if (increases > decreases) return 'increasing';
  if (decreases > increases) return 'decreasing';
  return 'stable';
}

/**
 * Hook for simple status display without performance tracking
 * Useful for basic status indicators and dashboards
 * 
 * @example
 * ```tsx
 * function SimpleStatus() {
 *   const { chainHeight, totalTransactions, isOnline } = useSimpleStatus();
 *   
 *   return (
 *     <div>
 *       <span>Height: {chainHeight || 'Loading...'}</span>
 *       <span>Transactions: {totalTransactions || 'Loading...'}</span>
 *       <span className={isOnline ? 'online' : 'offline'}>
 *         {isOnline ? 'Online' : 'Offline'}
 *       </span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSimpleStatus() {
  const { data, isLoading, isError, isSuccess } = useStatus();
  
  return {
    chainHeight: data?.chain_height,
    totalTransactions: data?.total_transactions,
    latestTick: data?.latest_tick,
    isOnline: isSuccess && data?.status === 'running',
    isLoading,
    isError,
  };
}

/**
 * Hook for real-time metrics with automatic updates
 * Optimized for dashboard displays with live updates
 * 
 * @example
 * ```tsx
 * function LiveMetrics() {
 *   const { 
 *     metrics, 
 *     tps, 
 *     tickRate,
 *     isLive 
 *   } = useRealTimeMetrics();
 *   
 *   return (
 *     <div className="live-metrics">
 *       <div className={`status ${isLive ? 'live' : 'stale'}`}>
 *         {isLive ? '🟢 LIVE' : '🟡 DELAYED'}
 *       </div>
 *       <MetricCard title="TPS" value={tps} />
 *       <MetricCard title="Tick Rate" value={tickRate} />
 *       <MetricCard title="Chain Height" value={metrics?.chainHeight} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useRealTimeMetrics() {
  const { 
    data, 
    performance, 
    isRealTime, 
    isPolling, 
    lastUpdated 
  } = useStatus({
    enableRealTime: true,
    trackPerformance: true,
    pollingInterval: 500, // Update every 10 seconds
  });

  const isLive = React.useMemo(() => {
    if (!lastUpdated) return false;
    const timeSinceUpdate = Date.now() - lastUpdated;
    return timeSinceUpdate < 30000; // Consider live if updated within 30 seconds
  }, [lastUpdated]);

  return {
    metrics: data ? {
      chainHeight: data.chain_height,
      totalTransactions: data.total_transactions,
      latestTick: data.latest_tick,
    } : null,
    
    // Performance indicators
    tps: performance?.transactionsPerSecond || 0,
    tickRate: performance?.ticksPerSecond || 0,
    avgTxPerTick: performance?.averageTransactionsPerTick || 0,
    
    // Status indicators
    isLive,
    isRealTime,
    isPolling,
    
    // Trends
    trends: performance?.trends,
    
    lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
  };
}