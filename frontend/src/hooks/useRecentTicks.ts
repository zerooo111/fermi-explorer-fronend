/**
 * Recent Ticks Hook for Continuum Sequencer
 *
 * Provides paginated recent ticks with real-time updates, infinite scrolling,
 * and intelligent caching strategies.
 */

import {
  useQuery,
  useInfiniteQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { queryKeys, cacheConfig, retryConfig } from '../api/queryKeys'
import type {
  RecentTicksResponse,
  RecentTicksParams,
  TickSummary,
  EnhancedTickSummary,
  QueryOptions,
} from '../api/types'
import { enhanceTickSummary } from '../api/types'
import React from 'react'

/**
 * Options for recent ticks hook
 */
export interface UseRecentTicksOptions extends QueryOptions {
  /**
   * Number of ticks to fetch per page
   */
  limit?: number

  /**
   * Initial offset for pagination
   */
  initialOffset?: number

  /**
   * Enable real-time updates
   */
  enableRealTime?: boolean

  /**
   * Polling interval for real-time updates (milliseconds)
   */
  pollingInterval?: number

  /**
   * Enable enhanced data processing
   */
  enhanceData?: boolean

  /**
   * Callback when new ticks are detected
   */
  onNewTicks?: (newTicks: TickSummary[], allTicks: TickSummary[]) => void

  /**
   * Callback when page loads
   */
  onPageLoad?: (page: RecentTicksResponse, pageIndex: number) => void
}

/**
 * Result for paginated recent ticks
 */
export interface RecentTicksResult {
  /**
   * Current page of ticks
   */
  ticks: TickSummary[]

  /**
   * Enhanced tick data (if enabled)
   */
  enhancedTicks: EnhancedTickSummary[]

  /**
   * Pagination info
   */
  pagination: {
    limit: number
    offset: number
    total: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  /**
   * Real-time status
   */
  realTime: {
    isEnabled: boolean
    isPolling: boolean
    lastUpdate: Date | null
    newTicksCount: number
  }
}

/**
 * Hook for fetching recent ticks with pagination
 *
 * @param options Configuration options
 * @returns Query result with recent ticks and pagination controls
 *
 * @example
 * ```tsx
 * function RecentTicksList() {
 *   const {
 *     result,
 *     isLoading,
 *     nextPage,
 *     previousPage,
 *     refresh
 *   } = useRecentTicks({
 *     limit: 20,
 *     enableRealTime: true,
 *     enhanceData: true,
 *     onNewTicks: (newTicks) => {
 *       toast.info(`${newTicks.length} new ticks available`);
 *     }
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <div className="real-time-status">
 *         {result.realTime.isPolling ? '🟢 Live' : '🟡 Paused'}
 *         {result.realTime.newTicksCount > 0 && (
 *           <button onClick={refresh}>
 *             {result.realTime.newTicksCount} new ticks
 *           </button>
 *         )}
 *       </div>
 *
 *       <div className="ticks-list">
 *         {result.enhancedTicks.map(tick => (
 *           <TickCard key={tick.tick_number} tick={tick} />
 *         ))}
 *       </div>
 *
 *       <div className="pagination">
 *         <button
 *           onClick={previousPage}
 *           disabled={!result.pagination.hasPreviousPage}
 *         >
 *           Previous
 *         </button>
 *         <span>
 *           Page {Math.floor(result.pagination.offset / result.pagination.limit) + 1}
 *         </span>
 *         <button
 *           onClick={nextPage}
 *           disabled={!result.pagination.hasNextPage}
 *         >
 *           Next
 *         </button>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRecentTicks(options: UseRecentTicksOptions = {}) {
  const {
    limit = 20,
    initialOffset = 0,
    enableRealTime = false,
    pollingInterval = 10000,
    enhanceData = false,
    onNewTicks,
    onPageLoad,
    staleTime = cacheConfig.recentTicks.staleTime,
    retry = retryConfig.data.retry,
    ...queryOptions
  } = options

  const [offset, setOffset] = React.useState(initialOffset)
  const [previousData, setPreviousData] = React.useState<TickSummary[] | null>(
    null,
  )
  const [newTicksCount, setNewTicksCount] = React.useState(0)

  const params: RecentTicksParams = { limit, offset }

  const query = useQuery<RecentTicksResponse, Error>({
    queryKey: queryKeys.ticks.recent(params),
    queryFn: async () => {
      const response = await apiClient.get<RecentTicksResponse>(
        `/api/v1/ticks/recent?limit=${limit}&offset=${offset}`,
      )
      return response
    },
    staleTime,
    gcTime: cacheConfig.recentTicks.cacheTime,
    retry,
    retryDelay: retryConfig.data.retryDelay,
    refetchInterval: enableRealTime ? pollingInterval : false,
    refetchIntervalInBackground: enableRealTime,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...queryOptions,
  } as UseQueryOptions<RecentTicksResponse, Error>)

  // Process and enhance data
  const result = React.useMemo((): RecentTicksResult => {
    const ticks = query.data?.ticks || []
    const enhancedTicks = enhanceData ? ticks.map(enhanceTickSummary) : []

    return {
      ticks,
      enhancedTicks,
      pagination: {
        limit,
        offset,
        total: query.data?.total || 0,
        hasNextPage: ticks.length === limit,
        hasPreviousPage: offset > 0,
      },
      realTime: {
        isEnabled: enableRealTime,
        isPolling: enableRealTime && !query.isPaused,
        lastUpdate: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
        newTicksCount,
      },
    }
  }, [
    query.data,
    enhanceData,
    limit,
    offset,
    enableRealTime,
    query.isPaused,
    query.dataUpdatedAt,
    newTicksCount,
  ])

  // Track new ticks for real-time updates
  React.useEffect(() => {
    if (enableRealTime && query.data?.ticks && previousData && offset === 0) {
      const previousTickNumbers = new Set(
        previousData.map((t) => t.tick_number),
      )

      const newTicks = query.data.ticks.filter(
        (tick) => !previousTickNumbers.has(tick.tick_number),
      )

      if (newTicks.length > 0) {
        setNewTicksCount((prev) => prev + newTicks.length)
        if (onNewTicks) {
          onNewTicks(newTicks, query.data.ticks)
        }
      }
    }

    if (query.data?.ticks) {
      setPreviousData(query.data.ticks)
    }
  }, [query.data?.ticks, previousData, enableRealTime, offset, onNewTicks])

  // Handle page load callback
  React.useEffect(() => {
    if (query.data && onPageLoad) {
      const pageIndex = Math.floor(offset / limit)
      onPageLoad(query.data, pageIndex)
    }
  }, [query.data, onPageLoad, offset, limit])

  // Reset new ticks count when data is refreshed manually
  const refresh = React.useCallback(() => {
    setNewTicksCount(0)
    query.refetch()
  }, [query.refetch])

  // Pagination controls
  const nextPage = React.useCallback(() => {
    if (result.pagination.hasNextPage) {
      setOffset((prev) => prev + limit)
      setNewTicksCount(0) // Reset when navigating
    }
  }, [result.pagination.hasNextPage, limit])

  const previousPage = React.useCallback(() => {
    if (result.pagination.hasPreviousPage) {
      setOffset((prev) => Math.max(0, prev - limit))
      setNewTicksCount(0) // Reset when navigating
    }
  }, [result.pagination.hasPreviousPage, limit])

  const goToPage = React.useCallback(
    (pageNumber: number) => {
      const newOffset = (pageNumber - 1) * limit
      if (newOffset >= 0) {
        setOffset(newOffset)
        setNewTicksCount(0)
      }
    },
    [limit],
  )

  const goToFirst = React.useCallback(() => {
    setOffset(0)
    setNewTicksCount(0)
  }, [])

  return {
    // Result data
    result,

    // Query states
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isSuccess: query.isSuccess,
    isError: query.isError,

    // Pagination controls
    nextPage,
    previousPage,
    goToPage,
    goToFirst,

    // Data controls
    refresh,
    refetch: query.refetch,

    // Query metadata
    lastUpdated: query.dataUpdatedAt,
    failureCount: query.failureCount,
  }
}

/**
 * Hook for infinite scrolling recent ticks
 * Provides seamless infinite scrolling with automatic loading
 *
 * @example
 * ```tsx
 * function InfiniteTicksList() {
 *   const {
 *     data,
 *     fetchNextPage,
 *     hasNextPage,
 *     isFetchingNextPage,
 *     isLoading
 *   } = useInfiniteRecentTicks({
 *     pageSize: 20,
 *     enableRealTime: true,
 *   });
 *
 *   return (
 *     <div>
 *       {data?.pages.map((page, pageIndex) => (
 *         <div key={pageIndex}>
 *           {page.ticks.map(tick => (
 *             <TickCard key={tick.tick_number} tick={tick} />
 *           ))}
 *         </div>
 *       ))}
 *
 *       {hasNextPage && (
 *         <button
 *           onClick={() => fetchNextPage()}
 *           disabled={isFetchingNextPage}
 *         >
 *           {isFetchingNextPage ? 'Loading...' : 'Load More'}
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteRecentTicks(
  options: {
    pageSize?: number
    enableRealTime?: boolean
    pollingInterval?: number
    enhanceData?: boolean
    maxPages?: number
  } = {},
) {
  const {
    pageSize = 20,
    enableRealTime = false,
    pollingInterval = 10000,
    enhanceData = false,
    maxPages = 50,
  } = options

  const query = useInfiniteQuery({
    queryKey: [...queryKeys.ticks.recent(), 'infinite', { pageSize }],
    queryFn: ({ pageParam = 0 }) => {
      const offset = pageParam as number
      return apiClient.get<RecentTicksResponse>(
        `/api/v1/ticks/recent?limit=${pageSize}&offset=${offset}`,
      )
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Stop if we've reached max pages or if we got fewer results than requested
      if (
        allPages.length >= maxPages ||
        (lastPage as RecentTicksResponse).ticks.length < pageSize
      ) {
        return undefined
      }
      return allPages.length * pageSize
    },
    staleTime: cacheConfig.recentTicks.staleTime,
    gcTime: cacheConfig.recentTicks.cacheTime,
    refetchInterval: enableRealTime ? pollingInterval : false,
    refetchIntervalInBackground: enableRealTime,
  })

  // Flatten all ticks from all pages
  const allTicks = React.useMemo(() => {
    if (!query.data) return []
    return query.data.pages.flatMap(
      (page) => (page as RecentTicksResponse).ticks || [],
    )
  }, [query.data])

  // Enhanced ticks if requested
  const enhancedTicks = React.useMemo(() => {
    return enhanceData ? allTicks.map(enhanceTickSummary) : []
  }, [allTicks, enhanceData])

  return {
    // Query data
    data: query.data,
    error: query.error,

    // Flattened data
    allTicks,
    enhancedTicks,
    totalTicks: allTicks.length,

    // Loading states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,

    // Pagination
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,

    // Page info
    pageCount: query.data?.pages.length || 0,
    maxPagesReached: query.data?.pages.length === maxPages,

    // Control functions
    refetch: query.refetch,

    // Query metadata
    lastUpdated: query.dataUpdatedAt,
  }
}

/**
 * Hook for real-time tick monitoring
 * Focused on detecting new ticks and providing notifications
 *
 * @example
 * ```tsx
 * function TickMonitor() {
 *   const {
 *     latestTick,
 *     newTicksCount,
 *     isMonitoring,
 *     startMonitoring,
 *     stopMonitoring,
 *     clearNewTicks
 *   } = useTickMonitor({
 *     interval: 5000,
 *     onNewTick: (tick) => {
 *       toast.success(`New tick #${tick.tick_number}`);
 *     }
 *   });
 *
 *   return (
 *     <div className="tick-monitor">
 *       <div className="status">
 *         {isMonitoring ? '🟢 Monitoring' : '🔴 Stopped'}
 *       </div>
 *       <div>Latest: #{latestTick?.tick_number}</div>
 *       <div>New ticks: {newTicksCount}</div>
 *       <button onClick={isMonitoring ? stopMonitoring : startMonitoring}>
 *         {isMonitoring ? 'Stop' : 'Start'} Monitoring
 *       </button>
 *       {newTicksCount > 0 && (
 *         <button onClick={clearNewTicks}>Clear</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTickMonitor(
  options: {
    interval?: number
    autoStart?: boolean
    onNewTick?: (tick: TickSummary) => void
    onError?: (error: Error) => void
  } = {},
) {
  const { interval = 5000, autoStart = true, onNewTick, onError } = options

  const [isMonitoring, setIsMonitoring] = React.useState(autoStart)
  const [previousLatestTick, setPreviousLatestTick] = React.useState<
    number | null
  >(null)
  const [newTicksCount, setNewTicksCount] = React.useState(0)

  const { result, error } = useRecentTicks({
    limit: 1,
    enableRealTime: isMonitoring,
    pollingInterval: interval,
  })

  const latestTick = result.ticks[0] || null

  // Detect new ticks
  React.useEffect(() => {
    if (latestTick && previousLatestTick !== null) {
      if (latestTick.tick_number > previousLatestTick) {
        const newTicksDetected = latestTick.tick_number - previousLatestTick
        setNewTicksCount((prev) => prev + newTicksDetected)

        if (onNewTick) {
          onNewTick(latestTick)
        }
      }
    }

    if (latestTick) {
      setPreviousLatestTick(latestTick.tick_number)
    }
  }, [latestTick, previousLatestTick, onNewTick])

  // Handle errors
  React.useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  const startMonitoring = React.useCallback(() => {
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = React.useCallback(() => {
    setIsMonitoring(false)
  }, [])

  const clearNewTicks = React.useCallback(() => {
    setNewTicksCount(0)
  }, [])

  return {
    latestTick,
    newTicksCount,
    isMonitoring,
    error,

    // Controls
    startMonitoring,
    stopMonitoring,
    clearNewTicks,

    // Status
    hasNewTicks: newTicksCount > 0,
    lastUpdate: result.realTime.lastUpdate,
  }
}
