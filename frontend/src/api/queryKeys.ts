/**
 * TanStack Query Key Factory for Continuum Sequencer API
 * 
 * Centralized query key management following TanStack Query best practices.
 * Provides type-safe, hierarchical cache keys for consistent cache invalidation
 * and efficient cache management.
 */

import type { RecentTicksParams } from './types';
import { getCacheConfig, getRealTimeConfig } from '../config/env';

/**
 * Query key factory following the recommended hierarchical structure:
 * 
 * - ['sequencer'] - All sequencer-related queries
 * - ['sequencer', 'health'] - Health checks
 * - ['sequencer', 'status'] - Status queries
 * - ['sequencer', 'transactions'] - All transaction queries
 * - ['sequencer', 'transactions', hash] - Specific transaction
 * - ['sequencer', 'ticks'] - All tick queries
 * - ['sequencer', 'ticks', 'recent', params] - Recent ticks with params
 * - ['sequencer', 'ticks', number] - Specific tick
 */

/**
 * Base query keys for different entity types
 */
export const queryKeys = {
  /**
   * Root key for all sequencer queries
   */
  all: ['sequencer'] as const,

  /**
   * Health check queries
   */
  health: {
    all: () => [...queryKeys.all, 'health'] as const,
    check: () => [...queryKeys.health.all()] as const,
  },

  /**
   * Status and metrics queries
   */
  status: {
    all: () => [...queryKeys.all, 'status'] as const,
    current: () => [...queryKeys.status.all()] as const,
  },

  /**
   * Transaction-related queries
   */
  transactions: {
    all: () => [...queryKeys.all, 'transactions'] as const,
    detail: (hash: string) => [...queryKeys.transactions.all(), hash] as const,
    search: (hash: string) => [...queryKeys.transactions.detail(hash)] as const,
  },

  /**
   * Tick-related queries
   */
  ticks: {
    all: () => [...queryKeys.all, 'ticks'] as const,
    recent: (params?: RecentTicksParams) => 
      [...queryKeys.ticks.all(), 'recent', params] as const,
    detail: (tickNumber: number) => 
      [...queryKeys.ticks.all(), tickNumber] as const,
    range: (start: number, end: number) => 
      [...queryKeys.ticks.all(), 'range', { start, end }] as const,
  },
} as const;

/**
 * Query key utilities for cache management
 */
export const queryKeyUtils = {
  /**
   * Invalidate all sequencer queries
   */
  invalidateAll: () => queryKeys.all,

  /**
   * Invalidate all health queries
   */
  invalidateHealth: () => queryKeys.health.all(),

  /**
   * Invalidate all status queries
   */
  invalidateStatus: () => queryKeys.status.all(),

  /**
   * Invalidate all transaction queries
   */
  invalidateTransactions: () => queryKeys.transactions.all(),

  /**
   * Invalidate specific transaction
   */
  invalidateTransaction: (hash: string) => queryKeys.transactions.detail(hash),

  /**
   * Invalidate all tick queries
   */
  invalidateTicks: () => queryKeys.ticks.all(),

  /**
   * Invalidate recent ticks (all variations)
   */
  invalidateRecentTicks: () => [...queryKeys.ticks.all(), 'recent'],

  /**
   * Invalidate specific tick
   */
  invalidateTick: (tickNumber: number) => queryKeys.ticks.detail(tickNumber),

  /**
   * Get query key for specific transaction
   */
  transactionKey: (hash: string) => queryKeys.transactions.detail(hash),

  /**
   * Get query key for specific tick
   */
  tickKey: (tickNumber: number) => queryKeys.ticks.detail(tickNumber),

  /**
   * Get query key for recent ticks with parameters
   */
  recentTicksKey: (params?: RecentTicksParams) => queryKeys.ticks.recent(params),
};

/**
 * Cache time constants (in milliseconds) from environment configuration
 */
export const cacheConfig = (() => {
  const cache = getCacheConfig();
  const realTime = getRealTimeConfig();
  
  return {
    /**
     * Health check cache - short duration as it's used for monitoring
     */
    health: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: cache.defaultCacheTime,
    },

    /**
     * Status cache - medium duration with background refetch
     */
    status: {
      staleTime: cache.defaultStaleTime,
      cacheTime: cache.defaultCacheTime,
      refetchInterval: realTime.defaultPollingInterval,
    },

    /**
     * Transaction cache - long duration as transactions are immutable
     */
    transactions: {
      staleTime: Infinity, // Never stale - transactions don't change
      cacheTime: cache.defaultCacheTime * 2, // Extended cache for immutable data
    },

    /**
     * Tick cache - long duration as ticks are immutable once created
     */
    ticks: {
      staleTime: Infinity, // Never stale - ticks don't change
      cacheTime: cache.defaultCacheTime * 2, // Extended cache for immutable data
    },

    /**
     * Recent ticks cache - very short duration for high-frequency updates (100+ per second)
     */
    recentTicks: {
      staleTime: 2 * 1000, // 2 seconds
      cacheTime: 30 * 1000, // 30 seconds - reduced for frequent updates
      refetchInterval: realTime.fastPollingInterval,
    },
  };
})();

/**
 * Retry configuration for different query types
 */
export const retryConfig = {
  /**
   * Health checks - minimal retries for fast failure detection
   */
  health: {
    retry: 1,
    retryDelay: 1000,
  },

  /**
   * Status queries - moderate retries as they're important for UX
   */
  status: {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  /**
   * Data queries - aggressive retries as they're critical for functionality
   */
  data: {
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 404s - the data simply doesn't exist
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
};

/**
 * Query key matcher functions for selective invalidation
 */
export const queryMatchers = {
  /**
   * Match all transaction queries
   */
  isTransactionQuery: (queryKey: unknown[]) => {
    return queryKey.length >= 2 && 
           queryKey[0] === 'sequencer' && 
           queryKey[1] === 'transactions';
  },

  /**
   * Match all tick queries
   */
  isTickQuery: (queryKey: unknown[]) => {
    return queryKey.length >= 2 && 
           queryKey[0] === 'sequencer' && 
           queryKey[1] === 'ticks';
  },

  /**
   * Match recent tick queries
   */
  isRecentTicksQuery: (queryKey: unknown[]) => {
    return queryKey.length >= 3 && 
           queryKey[0] === 'sequencer' && 
           queryKey[1] === 'ticks' &&
           queryKey[2] === 'recent';
  },

  /**
   * Match specific tick query
   */
  isSpecificTickQuery: (queryKey: unknown[], tickNumber: number) => {
    return queryKey.length >= 3 && 
           queryKey[0] === 'sequencer' && 
           queryKey[1] === 'ticks' &&
           queryKey[2] === tickNumber;
  },

  /**
   * Match status queries
   */
  isStatusQuery: (queryKey: unknown[]) => {
    return queryKey.length >= 2 && 
           queryKey[0] === 'sequencer' && 
           queryKey[1] === 'status';
  },
};

/**
 * Cache invalidation helpers for common scenarios
 */
export const cacheInvalidation = {
  /**
   * Invalidate queries when new tick is created
   * This should invalidate recent ticks and status, but not individual ticks/transactions
   */
  onNewTick: () => [
    queryKeys.status.all(),
    ...queryKeyUtils.invalidateRecentTicks(),
  ],

  /**
   * Invalidate queries when new transaction is submitted
   * This should invalidate status and recent ticks
   */
  onNewTransaction: () => [
    queryKeys.status.all(),
    ...queryKeyUtils.invalidateRecentTicks(),
  ],

  /**
   * Invalidate queries when connection is restored
   * This should refetch all data to ensure consistency
   */
  onConnectionRestore: () => [
    queryKeys.all,
  ],

  /**
   * Selective invalidation for performance
   * Only invalidate recent/dynamic data, keep immutable data cached
   */
  onPeriodicRefresh: () => [
    queryKeys.status.all(),
    ...queryKeyUtils.invalidateRecentTicks(),
  ],
};

/**
 * Export type-safe query key types for use in hooks
 */
export type QueryKey = readonly unknown[];
export type HealthQueryKey = ReturnType<typeof queryKeys.health[keyof typeof queryKeys.health]>;
export type StatusQueryKey = ReturnType<typeof queryKeys.status[keyof typeof queryKeys.status]>;
export type TransactionQueryKey = ReturnType<typeof queryKeys.transactions[keyof typeof queryKeys.transactions]>;
export type TickQueryKey = ReturnType<typeof queryKeys.ticks[keyof typeof queryKeys.ticks]>;

/**
 * Helper function to create parameterized query keys
 */
export const createParameterizedKey = <T extends Record<string, unknown>>(
  baseKey: readonly unknown[],
  params: T
): readonly unknown[] => {
  return [...baseKey, params] as const;
};

/**
 * Helper function to extract parameters from query key
 */
export const extractParams = <T = unknown>(queryKey: readonly unknown[], index: number): T | undefined => {
  return queryKey[index] as T | undefined;
};