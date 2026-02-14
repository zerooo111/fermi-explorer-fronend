/**
 * Health check and status types
 */

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
 * Health endpoint response from Continuum
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
