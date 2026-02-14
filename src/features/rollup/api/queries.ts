/**
 * Rollup Feature Query Definitions
 *
 * Pure query function definitions for use with TanStack Query.
 */

import { getApiClient } from '@/shared/api/client'
import { rollupRoutes } from '@/shared/lib/routes'
import type {
  NodeStatus,
  MarketsResponse,
  BlockWithDetails,
  Block,
  Transaction,
  EventsResponse,
} from '@/features/rollup/types/api'

/**
 * Query function to fetch node status
 */
export async function fetchStatus(): Promise<NodeStatus> {
  const client = getApiClient()
  const response = await client.get<NodeStatus>(rollupRoutes.STATUS)
  return response.data
}

/**
 * Query function to fetch all markets
 */
export async function fetchMarkets(): Promise<MarketsResponse> {
  const client = getApiClient()
  const response = await client.get<MarketsResponse>(rollupRoutes.MARKETS)
  return response.data
}

/**
 * Query function to fetch the latest block
 */
export async function fetchLatestBlock(): Promise<BlockWithDetails> {
  const client = getApiClient()
  const response = await client.get<BlockWithDetails>(rollupRoutes.LATEST_BLOCK)
  return response.data
}

/**
 * Query function to fetch a specific block by height
 */
export async function fetchBlock(height: number): Promise<BlockWithDetails> {
  const client = getApiClient()
  const response = await client.get<BlockWithDetails>(rollupRoutes.BLOCK(height))
  return response.data
}

/**
 * Query function to fetch blocks list
 */
export async function fetchBlocks(
  limit: number = 20,
  offset: number = 0,
): Promise<Block[]> {
  const client = getApiClient()
  const response = await client.get<Block[]>(rollupRoutes.BLOCKS(limit, offset))
  return response.data
}

/**
 * Query function to fetch a transaction
 */
export async function fetchTransaction(id: string): Promise<Transaction> {
  const client = getApiClient()
  const response = await client.get<Transaction>(rollupRoutes.TRANSACTION(id))
  return response.data
}

/**
 * Query function to fetch events
 */
export async function fetchEvents(
  marketId?: string,
  limit: number = 20,
  offset: number = 0,
): Promise<EventsResponse> {
  const client = getApiClient()
  const response = await client.get<EventsResponse>(
    rollupRoutes.EVENTS(marketId, limit, offset),
  )
  return response.data
}
