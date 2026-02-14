/**
 * Shared API types for Continuum Explorer
 *
 * Core interfaces used across frontend and backend for API communication.
 * These types ensure consistency between client and server implementations.
 *
 * NOTE: This file re-exports types from the reorganized API types module.
 * New code should import directly from '@/shared/types/api/'.
 */

// Re-export base types
export type {
  BaseResponse,
  ApiErrorResponse,
  WrappedResponse,
  WebSocketMessage,
  WebSocketState,
  HealthResponse,
  StatusResponse,
  ContinuumHealthResponse,
  ContinuumInfoResponse,
  ContinuumStatsResponse,
} from '../api'

// Re-export entity types needed here
export type { OrderIntent, PayloadDecoded, ContinuumTransaction, Tick, TickSummary, TickTransaction } from '@/entities'

/**
 * Transaction lookup endpoint response (new format)
 * GET /api/v1/tx/{hash}
 */
export interface TransactionResponse {
  data: {
    tx_hash: string
    tx_id: string
    payload: string
    tick_number: number
    sequence_number: number
    timestamp: number
    signature: string
  }
  source: string
}

/**
 * Basic tick information (continuum source)
 */
export interface TickData {
  tick_number: number
  timestamp: number // Microseconds since Unix epoch
  transaction_count: number
  transaction_batch_hash: string // Hex-encoded hash
  vdf_iterations: number
  previous_output?: string // Hex-encoded VDF output
}

/**
 * Detailed tick information (database source)
 */
export interface DetailedTickData {
  tick_number: number
  timestamp: number
  vdf_input: string
  vdf_output: string
  vdf_iterations: number
  vdf_proof: string
  previous_output?: string
  transaction_batch_hash: string
  transaction_count: number
  processed_at: string
  version: number
  transactions?: TickData[]
}

/**
 * Continuum source tick response
 */
export interface ContinuumTickResponse {
  data: {
    found: boolean
    tick: TickData
    tick_number: number
  }
  source: 'continuum'
}

/**
 * Database source tick response
 */
export interface DatabaseTickResponse {
  data: DetailedTickData
  source: 'db'
}

/**
 * Tick lookup endpoint response (union of both formats)
 * GET /api/v1/tick/{number}
 */
export type TickResponse = ContinuumTickResponse | DatabaseTickResponse

// ============================================================================
// Continuum Tick Types (re-export from entities)
// ============================================================================

export type { VdfProof, ContinuumVDFProof } from '@/entities'

/**
 * Recent transactions response from new Continuum API
 * GET /api/v1/continuum/txn/recent?limit={limit}
 */
export interface ContinuumRecentTransactionsResponse {
  count: number
  transactions: Array<{
    tx_hash: string
    tx_id: string
    payload: string
    tick_number: number
    sequence_number: number
    timestamp: number
  }>
  latest_tick_number: number
}

/**
 * Recent ticks endpoint response
 * GET /api/v1/continuum/tick/recent
 */
export interface RecentTicksResponse {
  ticks: TickSummary[]
  count: number // Number of ticks returned
  latest_tick_number: number // Latest tick number in the system
}

/**
 * Query parameters for recent ticks endpoint
 */
export interface RecentTicksParams {
  limit?: number // Default: 20, Max: 100
  offset?: number // Default: 0
}

/**
 * API client configuration
 */
export interface ApiConfiguration {
  baseUrl: string
  timeout: number
  retries: number
  defaultStaleTime: number
  defaultCacheTime: number
}