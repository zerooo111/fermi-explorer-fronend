/**
 * Transaction Entity Domain Model
 *
 * Unified domain model for transactions across Continuum and Rollup layers.
 * Normalizes ContinuumTransaction, TransactionData, and order/cancel types.
 */

/**
 * Transaction type/kind
 */
export type TransactionType = 'continuum' | 'rollup-order' | 'rollup-cancel'

/**
 * Transaction processing status
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'finalized' | 'error'

/**
 * Order intent structure (decoded from payload)
 */
export interface OrderIntent {
  base_mint: string
  expiry: number
  order_id: number
  owner: string
  price: number
  quantity: number
  quote_mint: string
  side: 'buy' | 'sell'
}

/**
 * Decoded payload data
 */
export interface PayloadDecoded {
  data: {
    intent?: OrderIntent
    local_sequencer_id?: string
    signature?: string
    timestamp_ms?: string
    type: string
    version: string
    [key: string]: unknown
  }
  protocol: string
}

/**
 * Core Transaction entity - unified domain model for Continuum
 */
export interface ContinuumTransaction {
  tx_hash: string
  tx_id: string
  payload: string
  payload_decoded?: PayloadDecoded
  payload_size: number
  signature: string
  public_key?: string
  nonce: number
  timestamp: number // Unix microseconds
  client_timestamp?: number
  sequence_number: number
  tick_number: number
  ingestion_timestamp: number
  created_at?: string
  status: TransactionStatus
  version?: number
}

/**
 * Rollup transaction (order or cancel)
 */
export interface RollupTransaction {
  id: string
  block_height: number
  batch_index: number
  sequence_number: number
  owner: string
  type: 'order' | 'cancel'
  timestamp: number
  status: TransactionStatus
  signature?: string
}

/**
 * Order transaction
 */
export interface OrderTransaction extends RollupTransaction {
  type: 'order'
  market: string
  base_mint: string
  quote_mint: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  leverage?: number
  order_id?: number
}

/**
 * Cancel transaction
 */
export interface CancelTransaction extends RollupTransaction {
  type: 'cancel'
  order_id: string
  reason?: string
}

/**
 * Union type for any transaction
 */
export type Transaction = ContinuumTransaction | RollupTransaction

/**
 * Transaction with related context
 */
export interface TransactionWithContext extends ContinuumTransaction {
  tick_context?: {
    tick_number: number
    timestamp: number
    transaction_count: number
  }
  block_context?: {
    block_height: number
    batch_index: number
  }
}

/**
 * Type guards
 */
export function isContinuumTransaction(value: unknown): value is ContinuumTransaction {
  if (!value || typeof value !== 'object') return false
  const obj = value as unknown as Record<string, unknown>
  return (
    typeof obj.tx_hash === 'string' &&
    typeof obj.tx_id === 'string' &&
    typeof obj.sequence_number === 'number' &&
    typeof obj.tick_number === 'number'
  )
}

export function isRollupTransaction(value: unknown): value is RollupTransaction {
  if (!value || typeof value !== 'object') return false
  const obj = value as unknown as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.block_height === 'number' &&
    (obj.type === 'order' || obj.type === 'cancel')
  )
}

export function isOrderTransaction(value: unknown): value is OrderTransaction {
  return isRollupTransaction(value) && (value as RollupTransaction).type === 'order'
}

export function isCancelTransaction(value: unknown): value is CancelTransaction {
  return isRollupTransaction(value) && (value as RollupTransaction).type === 'cancel'
}
