/**
 * Block Entity Domain Model
 *
 * Unified domain model for blocks in the execution (Rollup) layer.
 */

/**
 * Block status
 */
export type BlockStatus = 'pending' | 'confirmed' | 'finalized' | 'error'

/**
 * Batch summary within a block
 */
export interface BatchSummary {
  batch_index: number
  batch_hash: string
  order_count: number
  cancel_count: number
  sequence_numbers: number[]
  tick_number?: number // Link to continuum tick
}

/**
 * Core Block entity
 */
export interface Block {
  height: number
  timestamp: number // Unix timestamp
  state_root: string // Hex-encoded state root hash
  previous_state_root?: string
  transaction_count: number
  order_count: number
  cancel_count: number
  batch_count: number
  batches: BatchSummary[]
  status: BlockStatus
  processed_at?: string
  version?: number
}

/**
 * Block with full transaction list
 */
export interface BlockWithTransactions extends Block {
  transactions: Array<{
    id: string
    type: 'order' | 'cancel'
    owner: string
    sequence_number: number
  }>
}

/**
 * Block summary for listings
 */
export interface BlockSummary {
  height: number
  timestamp: number
  transaction_count: number
  order_count: number
  cancel_count: number
  batch_count: number
  state_root: string
  status: BlockStatus
}

/**
 * State root comparison for diff viewing
 */
export interface StateRootDiff {
  current: string
  previous: string
  changes?: Array<{
    address: string
    old_value?: string
    new_value?: string
  }>
}

/**
 * Batch with full details
 */
export interface BatchDetail extends BatchSummary {
  orders: Array<{
    id: string
    owner: string
    market: string
    side: 'buy' | 'sell'
  }>
  cancels: Array<{
    id: string
    owner: string
    order_id: string
  }>
}

/**
 * Type guards
 */
export function isBlock(value: unknown): value is Block {
  if (!value || typeof value !== 'object') return false
  const obj = value as unknown as Record<string, unknown>
  return (
    typeof obj.height === 'number' &&
    typeof obj.timestamp === 'number' &&
    typeof obj.state_root === 'string' &&
    Array.isArray(obj.batches)
  )
}

export function isBlockWithTransactions(value: unknown): value is BlockWithTransactions {
  return isBlock(value) && Array.isArray((value as unknown as Record<string, unknown>).transactions)
}

export function isBlockSummary(value: unknown): value is BlockSummary {
  if (!value || typeof value !== 'object') return false
  const obj = value as unknown as Record<string, unknown>
  return (
    typeof obj.height === 'number' &&
    typeof obj.timestamp === 'number' &&
    typeof obj.state_root === 'string'
  )
}
