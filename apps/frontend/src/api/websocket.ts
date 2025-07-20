/**
 * WebSocket Client for Continuum Tick Streaming
 * 
 * Provides real-time tick streaming capabilities with automatic reconnection,
 * error handling, and TypeScript support.
 */

import { config } from '../config/env'
import type { Tick } from './types'

/**
 * WebSocket message types
 */
export type WebSocketMessage = 
  | { type: 'tick'; tick_number: number; timestamp: number; transaction_count: number; transaction_batch_hash: string; previous_output: string; vdf_proof: { input: string; output: string; proof: string; iterations: number }; transactions: Array<{ tx_id: string; sequence_number: number; nonce: number; ingestion_timestamp: number; payload_size: number }> }
  | { type: 'error'; error: string }

/**
 * WebSocket connection state
 */
export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * WebSocket client configuration
 */
export interface WebSocketConfig {
  url?: string
  startTick?: number
  reconnectDelay?: number
  maxReconnectDelay?: number
  reconnectAttempts?: number
  heartbeatInterval?: number
  throttleMs?: number // Throttle tick processing to prevent memory overload
}

/**
 * WebSocket event callbacks
 */
export interface WebSocketCallbacks {
  onTick?: (tick: Tick) => void
  onError?: (error: Error) => void
  onStateChange?: (state: WebSocketState) => void
  onReconnect?: (attempt: number) => void
}

/**
 * Default WebSocket configuration
 */
const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  url: config.websocket.url,
  startTick: 0,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  reconnectAttempts: Infinity,
  heartbeatInterval: 30000,
  throttleMs: 50, // Throttle to ~20 FPS to prevent memory overload
}

/**
 * WebSocket client for tick streaming
 */
export class TickStreamClient {
  private ws: WebSocket | null = null
  private config: Required<WebSocketConfig>
  private callbacks: WebSocketCallbacks
  private state: WebSocketState = 'disconnected'
  private reconnectAttempt = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isClosing = false
  
  // Throttling mechanism to prevent memory overload
  private lastTickTime = 0
  private pendingTick: Tick | null = null
  private throttleTimeout: NodeJS.Timeout | null = null

  constructor(config: WebSocketConfig = {}, callbacks: WebSocketCallbacks = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.callbacks = callbacks
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected')
      return
    }

    this.isClosing = false
    this.updateState('connecting')

    try {
      const url = new URL(this.config.url)
      if (this.config.startTick > 0) {
        url.searchParams.set('start_tick', this.config.startTick.toString())
      }

      this.ws = new WebSocket(url.toString())
      this.setupEventHandlers()
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.updateState('error')
      this.callbacks.onError?.(error as Error)
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.isClosing = true
    this.cleanupReconnect()
    this.cleanupHeartbeat()
    this.cleanupThrottling()

    if (this.ws) {
      // Remove all event listeners before closing to prevent memory leaks
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onerror = null
      this.ws.onclose = null
      
      // Close the connection with proper code and reason
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect')
      }
      this.ws = null
    }

    this.updateState('disconnected')
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return this.state
  }

  /**
   * Send a message to the server
   */
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('Cannot send message: WebSocket not connected')
    }
  }

  /**
   * Update start tick and reconnect
   */
  updateStartTick(startTick: number): void {
    this.config.startTick = startTick
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.disconnect()
      this.connect()
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.updateState('connected')
      this.reconnectAttempt = 0
      this.setupHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
        this.callbacks.onError?.(new Error('Invalid message format'))
      }
    }

    this.ws.onerror = (event) => {
      console.error('WebSocket error:', event)
      this.updateState('error')
      this.callbacks.onError?.(new Error('WebSocket connection error'))
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
      this.cleanupHeartbeat()
      
      if (!this.isClosing) {
        this.updateState('disconnected')
        this.scheduleReconnect()
      }
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'tick':
        const tick: Tick = {
          tick_number: message.tick_number,
          timestamp: message.timestamp,
          transaction_count: message.transaction_count,
          transaction_batch_hash: message.transaction_batch_hash,
          previous_output: message.previous_output,
          vdf_proof: message.vdf_proof,
          transactions: message.transactions,
        }
        this.handleThrottledTick(tick)
        break

      case 'error':
        console.error('Server error:', message.error)
        this.callbacks.onError?.(new Error(message.error))
        break

      default:
        console.warn('Unknown message type:', (message as any).type)
    }
  }

  /**
   * Handle tick with throttling to prevent memory overload
   */
  private handleThrottledTick(tick: Tick): void {
    const now = Date.now()
    
    // Always keep the latest tick
    this.pendingTick = tick
    
    // If enough time has passed since last tick, process immediately
    if (now - this.lastTickTime >= this.config.throttleMs) {
      this.processPendingTick()
      return
    }
    
    // Otherwise, schedule processing if not already scheduled
    if (!this.throttleTimeout) {
      const remainingTime = this.config.throttleMs - (now - this.lastTickTime)
      this.throttleTimeout = setTimeout(() => {
        this.processPendingTick()
      }, remainingTime)
    }
  }

  /**
   * Process the pending tick and update timing
   */
  private processPendingTick(): void {
    if (this.pendingTick) {
      this.callbacks.onTick?.(this.pendingTick)
      this.pendingTick = null
      this.lastTickTime = Date.now()
    }
    
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout)
      this.throttleTimeout = null
    }
  }

  /**
   * Update connection state
   */
  private updateState(state: WebSocketState): void {
    if (this.state !== state) {
      this.state = state
      this.callbacks.onStateChange?.(state)
    }
  }

  /**
   * Setup heartbeat to keep connection alive
   */
  private setupHeartbeat(): void {
    this.cleanupHeartbeat()
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Cleanup heartbeat interval
   */
  private cleanupHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.isClosing || this.reconnectAttempt >= this.config.reconnectAttempts) {
      return
    }

    this.cleanupReconnect()
    
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempt),
      this.config.maxReconnectDelay
    )

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt + 1})`)
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempt++
      this.callbacks.onReconnect?.(this.reconnectAttempt)
      this.connect()
    }, delay)
  }

  /**
   * Cleanup reconnection timeout
   */
  private cleanupReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  /**
   * Cleanup throttling timeout and pending tick
   */
  private cleanupThrottling(): void {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout)
      this.throttleTimeout = null
    }
    this.pendingTick = null
    this.lastTickTime = 0
  }
}

/**
 * Create a tick stream client with default configuration
 */
export function createTickStreamClient(
  config?: WebSocketConfig,
  callbacks?: WebSocketCallbacks
): TickStreamClient {
  return new TickStreamClient(config, callbacks)
}