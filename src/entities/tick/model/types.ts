/**
 * Tick Entity Domain Model
 *
 * Unified domain model for ticks across the application.
 * Normalizes ContinuumTick, TickData, and DetailedTickData from API responses.
 */

/**
 * VDF Proof for a tick
 */
export interface VdfProof {
  input: string
  output: string
  proof: string
  iterations: number
}

/**
 * VDF Proof structure from new Continuum API
 * Alias for compatibility
 */
export type ContinuumVDFProof = VdfProof

/**
 * Status of a tick's VDF proof verification
 */
export type TickStatus = 'pending' | 'confirmed' | 'error'

/**
 * Statistics for a tick
 */
export interface TickStats {
  tps?: number // Transactions per second
  average_tick_time?: number // Average time between ticks
  tick_count?: number // Total ticks processed
}

/**
 * Core Tick entity - unified domain model
 */
export interface Tick {
  tick_number: number
  timestamp: number // Unix timestamp in microseconds
  transaction_count: number
  transaction_batch_hash: string
  vdf_proof?: VdfProof
  previous_output?: string
  status: TickStatus
  processed_at?: string
  version?: number
}

/**
 * Detailed tick with full VDF information from database
 */
export interface DetailedTick extends Tick {
  vdf_input: string
  vdf_output: string
  vdf_iterations: number
}

/**
 * Tick transaction - minimal transaction info within a tick
 */
export interface TickTransaction {
  tx_id: string
  tx_hash: string
  sequence_number: number
  nonce: number
  payload_size: number
  ingestion_timestamp: number
}

/**
 * Tick with transactions included
 */
export interface TickWithTransactions extends Tick {
  transactions: TickTransaction[]
}

/**
 * Tick summary for listings
 */
export interface TickSummary {
  tick_number: number
  timestamp: number
  transaction_count: number
  transaction_batch_hash?: string
}

/**
 * Type guards and utilities
 */
export function isTick(value: unknown): value is Tick {
  if (!value || typeof value !== 'object') return false
  const obj = value as unknown as Record<string, unknown>
  return (
    typeof obj.tick_number === 'number' &&
    typeof obj.timestamp === 'number' &&
    typeof obj.transaction_count === 'number' &&
    typeof obj.transaction_batch_hash === 'string'
  )
}

export function isDetailedTick(value: unknown): value is DetailedTick {
  return isTick(value) && typeof (value as unknown as Record<string, unknown>).vdf_input === 'string'
}

export function isTickWithTransactions(value: unknown): value is TickWithTransactions {
  return isTick(value) && Array.isArray((value as unknown as Record<string, unknown>).transactions)
}
