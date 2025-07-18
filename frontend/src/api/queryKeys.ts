/**
 * TanStack Query Key Factory (Simplified for MVP)
 */

import type { RecentTicksParams } from './types'

/**
 * Query key factory following hierarchical structure
 */
export const queryKeys = {
  /**
   * Health monitoring queries
   */
  health: {
    all: () => ['health'] as const,
    check: () => [...queryKeys.health.all(), 'check'] as const,
  },

  /**
   * Status queries
   */
  status: {
    all: () => ['status'] as const,
    current: () => [...queryKeys.status.all(), 'current'] as const,
  },

  /**
   * Transaction queries
   */
  transactions: {
    all: () => ['transactions'] as const,
    detail: (hash: string) => [...queryKeys.transactions.all(), hash] as const,
  },

  /**
   * Tick queries
   */
  ticks: {
    all: () => ['ticks'] as const,
    detail: (tickNumber: number) =>
      [...queryKeys.ticks.all(), 'detail', tickNumber] as const,
    recent: (params?: RecentTicksParams) =>
      [...queryKeys.ticks.all(), 'recent', params] as const,
  },
} as const

/**
 * Simple cache configuration
 */
export const cacheConfig = {
  health: {
    refetchInterval: 500, // 5 seconds
  },
  status: {
    refetchInterval: 500, // 1 second
  },
  transactions: {
    staleTime: 600000, // 10 minutes (immutable)
    cacheTime: 3600000, // 1 hour
  },
  ticks: {
    staleTime: 600000, // 5 minutes (mostly immutable)
    cacheTime: 0, // 30 minutes
  },
  recentTicks: {
    staleTime: 5000, // 5 seconds
    cacheTime: 0, // 1 minute
    refetchInterval: 1, // 10 seconds
  },
}
