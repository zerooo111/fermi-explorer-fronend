/**
 * Health Check Hook for Continuum Sequencer
 *
 * Provides health monitoring capabilities with automatic retry logic
 * and connection status tracking.
 */
import React from 'react'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { queryKeys, cacheConfig, retryConfig } from '../api/queryKeys'
import type { HealthResponse, QueryOptions } from '../api/types'

/**
 * Options for health check hook
 */
export interface UseHealthOptions extends QueryOptions {
  /**
   * Enable continuous polling for health status
   */
  enablePolling?: boolean

  /**
   * Polling interval in milliseconds (default: 30 seconds)
   */
  pollingInterval?: number

  /**
   * Callback when health status changes
   */
  onStatusChange?: (isHealthy: boolean) => void

  /**
   * Callback when connection is lost
   */
  onConnectionLost?: () => void

  /**
   * Callback when connection is restored
   */
  onConnectionRestored?: () => void
}

/**
 * Hook for monitoring sequencer health status
 *
 * @param options Configuration options for the health check
 * @returns Query result with health data and connection status
 *
 * @example
 * ```tsx
 * function HealthIndicator() {
 *   const { data, isConnected, connectionStatus } = useHealth({
 *     enablePolling: true,
 *     onConnectionLost: () => toast.error('Connection lost'),
 *     onConnectionRestored: () => toast.success('Connection restored'),
 *   });
 *
 *   return (
 *     <div className={`status-indicator ${connectionStatus}`}>
 *       {isConnected ? 'Online' : 'Offline'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useHealth(options: UseHealthOptions = {}) {
  const {
    enablePolling = false,
    pollingInterval = 30000,
    onStatusChange,
    onConnectionLost,
    onConnectionRestored,
    staleTime = cacheConfig.health.staleTime,
    retry = retryConfig.health.retry,
    ...queryOptions
  } = options

  const query = useQuery<HealthResponse, Error>({
    queryKey: queryKeys.health.check(),
    queryFn: () => apiClient.get<HealthResponse>('/api/v1/health'),
    staleTime,
    gcTime: cacheConfig.health.cacheTime,
    retry,
    retryDelay: retryConfig.health.retryDelay,
    refetchInterval: enablePolling ? pollingInterval : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...queryOptions,
  } as UseQueryOptions<HealthResponse, Error>)

  // Track connection status changes
  const isConnected = query.isSuccess && query.data?.status === 'healthy'
  const connectionStatus = query.isLoading
    ? 'connecting'
    : isConnected
      ? 'connected'
      : 'disconnected'

  // Handle status change callbacks
  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(isConnected)
    }
  }, [isConnected, onStatusChange])

  // Handle connection lost callback
  React.useEffect(() => {
    if (query.isError && onConnectionLost) {
      onConnectionLost()
    }
  }, [query.isError, onConnectionLost])

  // Handle connection restored callback
  React.useEffect(() => {
    if (
      query.isSuccess &&
      query.data?.status === 'healthy' &&
      onConnectionRestored
    ) {
      // Only call if we previously had an error
      if (query.error || query.failureCount > 0) {
        onConnectionRestored()
      }
    }
  }, [
    query.isSuccess,
    query.data?.status,
    query.error,
    query.failureCount,
    onConnectionRestored,
  ])

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

    // Connection status
    isConnected,
    connectionStatus,

    // Health status helpers
    isHealthy: query.data?.status === 'healthy',
    lastHealthCheck: query.data?.timestamp,

    // Control functions
    refetch: query.refetch,

    // Query metadata
    failureCount: query.failureCount,
    lastUpdated: query.dataUpdatedAt,
  }
}
