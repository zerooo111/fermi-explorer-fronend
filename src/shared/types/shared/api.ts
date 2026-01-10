/**
 * Shared API types for Continuum Explorer
 * 
 * Core interfaces used across frontend and backend for API communication.
 * These types ensure consistency between client and server implementations.
 */

/**
 * Base response interface that includes pagination metadata
 */
export interface BaseResponse {
  found?: boolean
}

/**
 * Error response format
 */
export interface ApiErrorResponse {
  error: string
}

/**
 * Wrapped response format for detail endpoints
 * New API format wraps responses in success/data structure
 */
export interface WrappedResponse<T> {
  success: boolean
  data: T
}

/**
 * Health check endpoint response
 * GET /api/v1/health
 */
export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: number // Unix timestamp in seconds
}

/**
 * Sequencer status endpoint response
 * From gRPC GetStatus call
 */
export interface StatusResponse {
  chain_height: number
  total_transactions: number
  status: string
  uptime_seconds: number
  txn_per_second: number
  ticks_per_second: number
  average_tick_time: number
  // Optional legacy fields for backward compatibility
  last_60_seconds?: {
    mean_tick_time_micros: number
    tick_count: number
  }
  latest_tick?: number
}

/**
 * Decoded payload structure for FRM orders
 */
export interface OrderIntent {
  base_mint: string
  expiry: number
  order_id: number
  owner: string
  price: number
  quantity: number
  quote_mint: string
  side: string
}

/**
 * Decoded payload data structure
 */
export interface PayloadDecoded {
  data: {
    intent: OrderIntent
    local_sequencer_id: string
    signature: string
    timestamp_ms: string
    type: string
    version: string
  }
  protocol: string
}

/**
 * Transaction data structure as returned in API responses
 */
export interface TransactionData {
  tick_number: number
  sequence_number: number
  tx_hash: string
  tx_id: string
  nonce: number
  payload: string
  payload_decoded?: PayloadDecoded
  timestamp: number
  signature: string
  ingestion_timestamp: number
  processed_at: string
  payload_size: number
  version: number
}

/**
 * Transaction lookup endpoint response (new format)
 * GET /api/v1/tx/{hash}
 */
export interface TransactionResponse {
  data: TransactionData
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
  transactions?: TransactionData[]
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

/**
 * VDF Proof structure (legacy format)
 */
export interface VdfProof {
  input: string
  output: string
  proof: string
  iterations: number
}

// ============================================================================
// New Continuum API Types (from Fermi API Gateway)
// ============================================================================

/**
 * VDF Proof structure from new Continuum API
 * GET /api/v1/continuum/tick/{tickNumber}
 */
export interface ContinuumVDFProof {
  input: string
  output: string
  proof: string
  iterations: number
}

/**
 * Tick response from new Continuum API
 * GET /api/v1/continuum/tick/{tickNumber}
 */
export interface ContinuumTick {
  tick_number: number
  timestamp: number
  time: string
  vdf_proof?: ContinuumVDFProof
  transaction_count: number
  transaction_batch_hash: string
  previous_output?: string
  ingested_at: string
  transactions?: ContinuumTransaction[]
}

/**
 * Transaction from new Continuum API
 * GET /api/v1/continuum/txn/{txnId}
 * GET /api/v1/continuum/txn/recent
 */
export interface ContinuumTransaction {
  tx_hash: string
  tx_id: string
  payload: string
  payload_text?: string // Decoded payload as text
  payload_size: number
  signature: string
  public_key: string
  nonce: number
  timestamp: number // Unix microseconds
  client_timestamp: number
  sequence_number: number
  ingestion_timestamp: number
  tick_number: number
  created_at: string
}

/**
 * Recent transactions response from new Continuum API
 * GET /api/v1/continuum/txn/recent?limit={limit}
 */
export interface ContinuumRecentTransactionsResponse {
  count: number
  transactions: ContinuumTransaction[]
  latest_tick_number: number
}

/**
 * Transaction within a tick
 */
export interface TickTransaction {
  tx_id: string
  sequence_number: number
  nonce: number
  ingestion_timestamp: number
  payload_size: number
}

/**
 * Full tick information from WebSocket stream
 */
export interface Tick {
  tick_number: number
  timestamp: number // Microseconds since Unix epoch
  transaction_count: number
  transaction_batch_hash: string
  previous_output?: string
  vdf_proof: VdfProof
  transactions: TickTransaction[]
  metrics?: {
    ticks_per_second: number // Calculated by backend
    backend_timestamp: number // Backend timestamp in milliseconds
  }
}

/**
 * Simplified tick summary for listings
 */
export interface TickSummary {
  tick_number: number
  timestamp: number // Microseconds since Unix epoch
  transaction_count: number
  transaction_batch_hash?: string // Optional for backward compatibility
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
 * WebSocket message types
 */
export type WebSocketMessage =
  | { type: 'tick'; tick_number: number; timestamp: number; transaction_count: number; transaction_batch_hash: string; previous_output?: string; vdf_proof: VdfProof; transactions: TickTransaction[] }
  | { type: 'error'; error: string }
  | { type: 'ping' }
  | { type: 'pong' }

/**
 * WebSocket connection states
 */
export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error'

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

// ============================================================================
// Continuum Explorer API Responses (New Endpoints)
// ============================================================================

/**
 * Health endpoint response
 * GET /api/v1/continuum/health
 */
export interface ContinuumHealthResponse {
  status: string
  db_healthy: boolean
  latest_tick: number
}

/**
 * Info endpoint response
 * GET /api/v1/continuum/info
 */
export interface ContinuumInfoResponse {
  service: string
  version: string
  endpoints: Record<string, string>
}

/**
 * Stats endpoint response
 * GET /api/v1/continuum/stats
 */
export interface ContinuumStatsResponse {
  ticks_indexed: number
  transactions_indexed: number
  empty_ticks_skipped: number
  latest_tick_number: number
  memory_ticks_count: number
  memory_txs_count: number
  tick_hit_rate: number
  tx_hit_rate: number
  ticks_with_tx_ratio: number
  db_size_mb: number
}