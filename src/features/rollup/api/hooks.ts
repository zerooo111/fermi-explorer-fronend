/**
 * Rollup Feature Hooks
 *
 * Consolidated hooks for querying and managing Rollup/Execution data.
 * All hooks use React Query best practices.
 */

import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { getApiClient } from '@/shared/api/client'
import { rollupRoutes } from '@/shared/lib/routes'
import type {
  NodeStatus,
  MarketsResponse,
  BlockWithDetails,
  BlocksListResponse,
  Transaction,
  EventsResponse,
  Block,
} from '@/features/rollup/types/api'

/**
 * Fetch node/execution status
 */
export function useStatus(options?: Partial<UseQueryOptions>) {
  const client = getApiClient()

  return useQuery({
    queryKey: ['rollup', 'status'],
    queryFn: async () => {
      const response = await client.get<NodeStatus>(rollupRoutes.STATUS)
      return response.data
    },
    refetchInterval: 5000,
    ...options,
  })
}

/**
 * Fetch all markets
 */
export function useMarkets(options?: Partial<UseQueryOptions>) {
  const client = getApiClient()

  return useQuery({
    queryKey: ['rollup', 'markets'],
    queryFn: async () => {
      const response = await client.get<MarketsResponse>(rollupRoutes.MARKETS)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Fetch the latest block
 */
export function useLatestBlock(options?: Partial<UseQueryOptions>) {
  const client = getApiClient()

  return useQuery({
    queryKey: ['rollup', 'blocks', 'latest'],
    queryFn: async () => {
      const response = await client.get<BlockWithDetails>(rollupRoutes.LATEST_BLOCK)
      return response.data
    },
    refetchInterval: 1000,
    ...options,
  })
}

/**
 * Fetch a specific block by height
 */
export function useBlock(
  height: number | undefined,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: ['rollup', 'blocks', height],
    queryFn: async () => {
      if (height === undefined) {
        throw new Error('Block height is required')
      }
      const response = await client.get<BlockWithDetails>(
        rollupRoutes.BLOCK(height),
      )
      return response.data
    },
    enabled: height !== undefined,
    ...options,
  })
}

/**
 * Fetch blocks list with pagination
 */
export function useBlocks(
  limit: number = 20,
  offset: number = 0,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: ['rollup', 'blocks', { limit, offset }],
    queryFn: async () => {
      const response = await client.get<Block[]>(rollupRoutes.BLOCKS(limit, offset))
      return {
        blocks: response.data,
        total: response.data.length,
        limit,
        offset,
      } as BlocksListResponse
    },
    refetchInterval: 3000,
    ...options,
  })
}

/**
 * Fetch a specific transaction
 */
export function useTransaction(
  id: string | undefined,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: ['rollup', 'transactions', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Transaction ID is required')
      }
      const response = await client.get<Transaction>(rollupRoutes.TRANSACTION(id))
      return response.data
    },
    enabled: !!id,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || error?.message === 'Resource not found') {
        return false
      }
      return failureCount < 3
    },
    ...options,
  })
}

/**
 * Fetch events with optional market filter
 */
export function useEvents(
  marketId?: string,
  limit: number = 20,
  offset: number = 0,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: ['rollup', 'events', { marketId, limit, offset }],
    queryFn: async () => {
      const response = await client.get<EventsResponse>(
        rollupRoutes.EVENTS(marketId, limit, offset),
      )
      return response.data
    },
    ...options,
  })
}
