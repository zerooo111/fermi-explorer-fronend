/**
 * React Hook for WebSocket Tick Streaming
 *
 * Provides real-time tick updates with automatic connection management,
 * buffering, and integration with React lifecycle.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Tick, WebSocketState } from '@fermi/shared-types/api'
import type { WebSocketConfig } from '@/api/websocket'
import { TickStreamClient } from '@/api/websocket'

/**
 * Hook configuration options
 */
export interface UseTickStreamOptions extends Partial<WebSocketConfig> {
  enabled?: boolean
  maxBufferSize?: number
  onTick?: (tick: Tick) => void
  onError?: (error: Error) => void
  onStateChange?: (state: WebSocketState) => void

  /**
   * Maximum number of ticks to display in UI (default: 20)
   * Keeps memory usage bounded for high-frequency streams
   */
  displayLimit?: number
}

/**
 * Hook return value
 */
export interface UseTickStreamResult {
  ticks: Array<Tick>
  state: WebSocketState
  error: Error | null
  connect: () => void
  disconnect: () => void
  clearTicks: () => void
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempt: number
}

/**
 * Default options
 */
const DEFAULT_OPTIONS = {
  enabled: true,
  maxBufferSize: 10,
  displayLimit: 10,
}

/**
 * React hook for WebSocket tick streaming
 */
export function useTickStream(
  options: UseTickStreamOptions = {},
): UseTickStreamResult {
  const {
    enabled,
    maxBufferSize,
    displayLimit,
    onTick,
    onError,
    onStateChange,
    ...wsConfig
  } = { ...DEFAULT_OPTIONS, ...options }

  const [ticks, setTicks] = useState<Array<Tick>>([])
  const [state, setState] = useState<WebSocketState>('disconnected')
  const [error, setError] = useState<Error | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  // Memoize wsConfig to prevent unnecessary effect runs
  const memoizedWsConfig = useMemo(
    () => wsConfig,
    [
      wsConfig.url,
      wsConfig.startTick,
      wsConfig.reconnectDelay,
      wsConfig.maxReconnectDelay,
      wsConfig.reconnectAttempts,
      wsConfig.heartbeatInterval,
    ],
  )

  const clientRef = useRef<TickStreamClient | null>(null)
  const ticksRef = useRef<Array<Tick>>([])
  const rafRef = useRef<number | null>(null)
  const pendingTicksRef = useRef<Array<Tick>>([])
  const isUnmountedRef = useRef(false)

  // Store latest callbacks in refs to avoid stale closures
  const callbacksRef = useRef({ onTick, onError, onStateChange })
  useEffect(() => {
    callbacksRef.current = { onTick, onError, onStateChange }
  })

  /**
   * Process pending ticks in a single batch
   */
  const processPendingTicks = useCallback(() => {
    if (isUnmountedRef.current || pendingTicksRef.current.length === 0) {
      rafRef.current = null
      return
    }

    const memoryLimit = displayLimit || 20
    const newTicks = [...pendingTicksRef.current]

    // Clear pending ticks
    pendingTicksRef.current = []

    // Process all new ticks at once
    let updated = false
    newTicks.forEach((tick) => {
      // Only add if it's newer than what we have
      const currentNewest = ticksRef.current[0]
      if (!currentNewest || tick.tick_number > currentNewest.tick_number) {
        ticksRef.current = [tick, ...ticksRef.current].slice(0, memoryLimit)
        updated = true
        // Call the callback for external handlers
        callbacksRef.current.onTick?.(tick)
      }
    })

    if (updated) {
      setTicks([...ticksRef.current])
    }

    rafRef.current = null
  }, [displayLimit])

  /**
   * Handle incoming tick - stable reference using useCallback
   */
  const handleTick = useCallback(
    (tick: Tick) => {
      if (isUnmountedRef.current) return

      // Add to pending ticks
      pendingTicksRef.current.push(tick)

      // Schedule batch update if not already scheduled
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processPendingTicks)
      }
    },
    [processPendingTicks],
  )

  /**
   * Handle errors - stable reference using useCallback
   */
  const handleError = useCallback((err: Error) => {
    if (isUnmountedRef.current) return

    setError(err)
    callbacksRef.current.onError?.(err)
  }, [])

  /**
   * Handle state changes - stable reference using useCallback
   */
  const handleStateChange = useCallback((newState: WebSocketState) => {
    if (isUnmountedRef.current) return

    setState(newState)
    callbacksRef.current.onStateChange?.(newState)

    if (newState === 'connected') {
      setError(null)
      setReconnectAttempt(0)
    }
  }, [])

  /**
   * Handle reconnection - stable reference using useCallback
   */
  const handleReconnect = useCallback((attempt: number) => {
    if (isUnmountedRef.current) return

    setReconnectAttempt(attempt)
  }, [])

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (isUnmountedRef.current) return

    if (!clientRef.current) {
      clientRef.current = new TickStreamClient(memoizedWsConfig, {
        onTick: handleTick,
        onError: handleError,
        onStateChange: handleStateChange,
        onReconnect: handleReconnect,
      })
    }
    clientRef.current.connect()
  }, [
    memoizedWsConfig,
    handleTick,
    handleError,
    handleStateChange,
    handleReconnect,
  ])

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }
  }, [])

  /**
   * Clear tick buffer
   */
  const clearTicks = useCallback(() => {
    if (isUnmountedRef.current) return

    ticksRef.current = []
    setTicks([])
  }, [])

  /**
   * Setup and cleanup
   */
  useEffect(() => {
    isUnmountedRef.current = false

    connect()

    return () => {
      isUnmountedRef.current = true

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }

      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
    }
  }, [enabled, connect])

  return {
    ticks,
    state,
    error,
    connect,
    disconnect,
    clearTicks,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    reconnectAttempt,
  }
}

/**
 * Hook for getting the latest tick from the stream
 */
export function useLatestTick(options?: UseTickStreamOptions): Tick | null {
  const { ticks } = useTickStream(options)
  return ticks[0] || null
}

/**
 * Hook for counting ticks in the current stream session
 */
export function useTickCount(options?: UseTickStreamOptions): number {
  const { ticks } = useTickStream(options)
  return ticks.length
}
