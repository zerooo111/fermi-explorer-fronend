/**
 * WebSocket types for real-time communication
 */

import type { VdfProof, TickTransaction } from '@/entities'

/**
 * WebSocket message types
 */
export type WebSocketMessage =
  | {
      type: 'tick'
      tick_number: number
      timestamp: number
      transaction_count: number
      transaction_batch_hash: string
      previous_output?: string
      vdf_proof: VdfProof
      transactions: TickTransaction[]
    }
  | { type: 'error'; error: string }
  | { type: 'ping' }
  | { type: 'pong' }

/**
 * WebSocket connection states
 */
export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error'
