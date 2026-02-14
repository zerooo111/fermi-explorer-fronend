/**
 * Continuum Feature Query Definitions
 *
 * Pure query function definitions for use with TanStack Query.
 * These can be used independently or through hooks.
 */

import { getApiClient } from '@/shared/api/client'
import type { WrappedResponse } from '@/shared/types/api'
import type {
  Tick,
  ContinuumTransaction,
  RecentTicksResponse,
  ContinuumRecentTransactionsResponse,
} from '@/shared/types/shared/api'
import { continuumRoutes } from '@/shared/lib/routes'

/**
 * Query function to fetch a single tick
 */
export async function fetchTick(tickNumber: number) {
  const client = getApiClient()
  const response = await client.get(continuumRoutes.TICK(tickNumber))
  return response.data
}

/**
 * Query function to fetch a single tick from new Continuum API
 */
export async function fetchContinuumTick(tickNumber: number): Promise<Tick> {
  const client = getApiClient()
  const response = await client.get<WrappedResponse<Tick>>(
    continuumRoutes.TICK(tickNumber),
  )
  return response.data.data
}

/**
 * Query function to fetch recent ticks
 */
export async function fetchRecentTicks(
  limit: number = 10,
): Promise<RecentTicksResponse> {
  const client = getApiClient()
  const response = await client.get<RecentTicksResponse>(
    continuumRoutes.TICKS({ limit }),
  )
  return response.data
}

/**
 * Query function to fetch a transaction by hash
 */
export async function fetchTransaction(hash: string) {
  const client = getApiClient()
  const response = await client.get(continuumRoutes.TX(hash))
  return response.data
}

/**
 * Query function to fetch a transaction by ID from new Continuum API
 */
export async function fetchContinuumTransaction(
  txnId: string,
): Promise<ContinuumTransaction> {
  const client = getApiClient()
  const response = await client.get<WrappedResponse<ContinuumTransaction>>(
    continuumRoutes.TXN(txnId),
  )
  return response.data.data
}

/**
 * Query function to fetch recent transactions
 */
export async function fetchRecentTransactions(
  limit: number = 50,
): Promise<ContinuumRecentTransactionsResponse> {
  const client = getApiClient()
  const response = await client.get<ContinuumRecentTransactionsResponse>(
    continuumRoutes.RECENT_TXN(limit),
  )
  return response.data
}
