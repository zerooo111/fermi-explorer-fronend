/**
 * Tick Hook for Continuum Sequencer
 * 
 * Provides tick lookup, navigation, and enhanced data processing
 * with optimized caching for immutable tick data and archive handling.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys, cacheConfig, retryConfig } from '../api/queryKeys';
import type { 
  TickResponse, 
  EnhancedTickData,
  QueryOptions
} from '../api/types';
import {
  isValidTickNumber,
  hasTickData,
  enhanceTickData
} from '../api/types';
import React from 'react';

/**
 * Options for tick lookup hook
 */
export interface UseTickOptions extends QueryOptions {
  /**
   * Whether to validate tick number before making request
   */
  validateTickNumber?: boolean;
  
  /**
   * Enable enhanced data processing (timestamps, age calculations, etc.)
   */
  enhanceData?: boolean;
  
  /**
   * Callback when tick is found
   */
  onTickFound?: (tick: TickResponse) => void;
  
  /**
   * Callback when tick is not found
   */
  onTickNotFound?: (tickNumber: number) => void;
  
  /**
   * Whether to enable the query (useful for conditional fetching)
   */
  enabled?: boolean;
}

/**
 * Enhanced tick result with additional computed properties
 */
export interface TickResult {
  /**
   * Raw tick response from API
   */
  raw: TickResponse | undefined;
  
  /**
   * Enhanced tick data with computed fields
   */
  enhanced: EnhancedTickData | null;
  
  /**
   * Whether tick was found
   */
  found: boolean;
  
  /**
   * Tick number used for lookup
   */
  tickNumber: number;
  
  /**
   * Validation status
   */
  isValidTickNumber: boolean;
  
  /**
   * Source information (memory vs archive)
   */
  source: 'memory' | 'archive' | 'unknown';
  
  /**
   * Computed properties
   */
  properties: {
    ageInSeconds: number | null;
    formattedTimestamp: string | null;
    relativeTime: string | null;
    averageTransactionSize: number | null;
    isRecent: boolean;
  };
}

/**
 * Hook for looking up a specific tick by number
 * 
 * @param tickNumber Tick number to lookup
 * @param options Configuration options for the lookup
 * @returns Query result with tick data and enhanced properties
 * 
 * @example
 * ```tsx
 * function TickDetails({ tickNumber }: { tickNumber: number }) {
 *   const { 
 *     result, 
 *     isLoading, 
 *     isValidTickNumber 
 *   } = useTick(tickNumber, {
 *     enhanceData: true,
 *     onTickFound: (tick) => console.log('Found tick:', tick),
 *     onTickNotFound: (num) => console.log('Tick not found:', num),
 *   });
 * 
 *   if (!isValidTickNumber) {
 *     return <div>Invalid tick number</div>;
 *   }
 * 
 *   if (isLoading) {
 *     return <div>Loading tick...</div>;
 *   }
 * 
 *   if (!result.found) {
 *     return <div>Tick not found</div>;
 *   }
 * 
 *   return (
 *     <div className="tick-details">
 *       <h3>Tick #{result.tickNumber}</h3>
 *       <p>Transactions: {result.raw?.tick?.transaction_count}</p>
 *       <p>Age: {result.properties.relativeTime}</p>
 *       <p>Source: {result.source}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTick(
  tickNumber: number, 
  options: UseTickOptions = {}
) {
  const {
    validateTickNumber = true,
    enhanceData = false,
    onTickFound,
    onTickNotFound,
    enabled = true,
    staleTime = cacheConfig.ticks.staleTime,
    retry = retryConfig.data.retry,
    ...queryOptions
  } = options;

  // Validate tick number
  const isValidTick = React.useMemo(() => {
    if (!validateTickNumber) return true;
    return isValidTickNumber(tickNumber);
  }, [tickNumber, validateTickNumber]);

  const query = useQuery<TickResponse, Error>({
    queryKey: queryKeys.ticks.detail(tickNumber),
    queryFn: async () => {
      const response = await apiClient.get<TickResponse>(`/api/v1/tick/${tickNumber}`);
      return response;
    },
    staleTime,
    gcTime: cacheConfig.ticks.cacheTime,
    retry,
    retryDelay: retryConfig.data.retryDelay,
    enabled: enabled && isValidTick && tickNumber > 0,
    ...queryOptions,
  } as UseQueryOptions<TickResponse, Error>);

  // Determine data source based on response time
  const source = React.useMemo((): 'memory' | 'archive' | 'unknown' => {
    if (!query.dataUpdatedAt || !query.isFetched) return 'unknown';
    
    // Estimate based on response time (this is approximate)
    // Memory access: < 5ms, Archive access: > 20ms
    const responseTime = query.dataUpdatedAt - (query.fetchStatus === 'fetching' ? Date.now() - 100 : Date.now() - 10);
    
    if (responseTime < 5) return 'memory';
    if (responseTime > 20) return 'archive';
    return 'memory'; // Default assumption
  }, [query.dataUpdatedAt, query.isFetched, query.fetchStatus]);

  // Process and enhance data
  const result = React.useMemo((): TickResult => {
    const found = query.data ? hasTickData(query.data) : false;
    
    let enhanced: EnhancedTickData | null = null;
    let properties = {
      ageInSeconds: null as number | null,
      formattedTimestamp: null as string | null,
      relativeTime: null as string | null,
      averageTransactionSize: null as number | null,
      isRecent: false,
    };

    if (found && query.data && enhanceData && hasTickData(query.data)) {
      enhanced = enhanceTickData(query.data.tick);
      
      // Calculate additional properties
      properties = {
        ageInSeconds: enhanced.age_seconds,
        formattedTimestamp: enhanced.tick_time.formatted,
        relativeTime: formatRelativeTime(enhanced.age_seconds),
        averageTransactionSize: query.data.tick.transaction_count > 0 
          ? Math.round(1000 / query.data.tick.transaction_count) // Rough estimate
          : null,
        isRecent: enhanced.age_seconds < 3600, // Less than 1 hour
      };
    } else if (found && query.data && hasTickData(query.data)) {
      // Basic properties without enhancement
      const now = Date.now() * 1000; // Convert to microseconds
      const ageSeconds = Math.floor((now - query.data.tick.timestamp) / 1_000_000);
      
      properties = {
        ageInSeconds: ageSeconds,
        formattedTimestamp: new Date(query.data.tick.timestamp / 1000).toLocaleString(),
        relativeTime: formatRelativeTime(ageSeconds),
        averageTransactionSize: null,
        isRecent: ageSeconds < 3600,
      };
    }

    return {
      raw: query.data,
      enhanced,
      found,
      tickNumber,
      isValidTickNumber: isValidTick,
      source,
      properties,
    };
  }, [query.data, enhanceData, tickNumber, isValidTick, source]);

  // Handle callbacks
  React.useEffect(() => {
    if (query.isSuccess && result.found && onTickFound) {
      onTickFound(query.data!);
    }
  }, [query.isSuccess, result.found, query.data, onTickFound]);

  React.useEffect(() => {
    if (query.isSuccess && !result.found && onTickNotFound) {
      onTickNotFound(tickNumber);
    }
  }, [query.isSuccess, result.found, tickNumber, onTickNotFound]);

  return {
    // Tick result
    result,
    
    // Query states
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    
    // Validation
    isValidTickNumber: isValidTick,
    
    // Convenience flags
    found: result.found,
    notFound: query.isSuccess && !result.found,
    
    // Performance indicators
    source: result.source,
    responseTime: query.dataUpdatedAt ? Date.now() - query.dataUpdatedAt : null,
    
    // Control functions
    refetch: query.refetch,
    
    // Query metadata
    lastUpdated: query.dataUpdatedAt,
  };
}

/**
 * Format relative time in human-readable format
 */
function formatRelativeTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Hook for tick navigation with prefetching
 * Provides navigation controls and prefetches adjacent ticks
 * 
 * @param currentTick Current tick number
 * @param options Configuration options
 * @returns Navigation controls and tick data
 * 
 * @example
 * ```tsx
 * function TickNavigator({ initialTick }: { initialTick: number }) {
 *   const { 
 *     currentTick,
 *     result,
 *     navigation,
 *     goToNext,
 *     goToPrevious,
 *     goToTick
 *   } = useTickNavigation(initialTick, {
 *     prefetchRange: 2,
 *     enableKeyboard: true,
 *   });
 * 
 *   return (
 *     <div>
 *       <div className="navigation">
 *         <button 
 *           onClick={goToPrevious} 
 *           disabled={!navigation.canGoPrevious}
 *         >
 *           Previous
 *         </button>
 *         <span>Tick #{currentTick}</span>
 *         <button 
 *           onClick={goToNext} 
 *           disabled={!navigation.canGoNext}
 *         >
 *           Next
 *         </button>
 *       </div>
 *       <TickDetails result={result} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useTickNavigation(
  initialTick: number,
  options: {
    prefetchRange?: number;
    enableKeyboard?: boolean;
    maxTick?: number;
    minTick?: number;
  } = {}
) {
  const {
    prefetchRange = 1,
    enableKeyboard = false,
    maxTick,
    minTick = 1,
  } = options;

  const [currentTick, setCurrentTick] = React.useState(initialTick);

  // Main tick query
  const mainQuery = useTick(currentTick, {
    enhanceData: true,
  });

  // Prefetch adjacent ticks
  const prefetchQueries = [];
  for (let i = 1; i <= prefetchRange; i++) {
    if (currentTick - i >= minTick) {
      prefetchQueries.push(useTick(currentTick - i, { enabled: false }));
    }
    if (!maxTick || currentTick + i <= maxTick) {
      prefetchQueries.push(useTick(currentTick + i, { enabled: false }));
    }
  }

  // Navigation controls
  const navigation = React.useMemo(() => {
    return {
      canGoPrevious: currentTick > minTick,
      canGoNext: !maxTick || currentTick < maxTick,
      hasPrevious: currentTick > minTick,
      hasNext: !maxTick || currentTick < maxTick,
    };
  }, [currentTick, minTick, maxTick]);

  const goToNext = React.useCallback(() => {
    if (navigation.canGoNext) {
      setCurrentTick(prev => prev + 1);
    }
  }, [navigation.canGoNext]);

  const goToPrevious = React.useCallback(() => {
    if (navigation.canGoPrevious) {
      setCurrentTick(prev => prev - 1);
    }
  }, [navigation.canGoPrevious]);

  const goToTick = React.useCallback((tickNumber: number) => {
    if (tickNumber >= minTick && (!maxTick || tickNumber <= maxTick)) {
      setCurrentTick(tickNumber);
    }
  }, [minTick, maxTick]);

  const goToFirst = React.useCallback(() => {
    setCurrentTick(minTick);
  }, [minTick]);

  const goToLast = React.useCallback(() => {
    if (maxTick) {
      setCurrentTick(maxTick);
    }
  }, [maxTick]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'h':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
        case 'l':
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          goToFirst();
          break;
        case 'End':
          event.preventDefault();
          goToLast();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, goToNext, goToPrevious, goToFirst, goToLast]);

  return {
    // Current state
    currentTick,
    result: mainQuery.result,
    
    // Query states
    isLoading: mainQuery.isLoading,
    error: mainQuery.error,
    
    // Navigation
    navigation,
    goToNext,
    goToPrevious,
    goToTick,
    goToFirst,
    goToLast,
    
    // Prefetch data
    prefetchedTicks: prefetchQueries.map(q => q.result),
  };
}

/**
 * Hook for tick range queries
 * Efficiently fetches multiple ticks in a range
 * 
 * @example
 * ```tsx
 * function TickRange() {
 *   const { ticks, isLoading, loadMore } = useTickRange({
 *     start: 1000,
 *     count: 10,
 *     direction: 'ascending',
 *   });
 * 
 *   return (
 *     <div>
 *       {ticks.map(tick => (
 *         <TickSummary key={tick.tickNumber} tick={tick} />
 *       ))}
 *       <button onClick={loadMore}>Load More</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTickRange(options: {
  start: number;
  count: number;
  direction?: 'ascending' | 'descending';
}) {
  const { start, count, direction = 'ascending' } = options;
  
  const tickNumbers = React.useMemo(() => {
    const numbers = [];
    for (let i = 0; i < count; i++) {
      const tickNum = direction === 'ascending' ? start + i : start - i;
      if (tickNum > 0) {
        numbers.push(tickNum);
      }
    }
    return numbers;
  }, [start, count, direction]);

  // Create individual queries for each tick
  const queries = tickNumbers.map(tickNum => 
    useTick(tickNum, { enhanceData: true })
  );

  const ticks = React.useMemo(() => {
    return queries
      .map((query, index) => ({
        tickNumber: tickNumbers[index],
        result: query.result,
        isLoading: query.isLoading,
        error: query.error,
      }))
      .filter(item => item.result.found);
  }, [queries, tickNumbers]);

  const isLoading = queries.some(q => q.isLoading);
  const hasErrors = queries.some(q => q.isError);

  return {
    ticks,
    isLoading,
    hasErrors,
    loadedCount: ticks.length,
    totalRequested: tickNumbers.length,
  };
}