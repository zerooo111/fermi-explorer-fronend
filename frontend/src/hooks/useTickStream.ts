/**
 * React Hook for WebSocket Tick Streaming
 * 
 * Provides real-time tick updates with automatic connection management,
 * buffering, and integration with React lifecycle.
 */

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { TickStreamClient } from '@/api/websocket'
import type { WebSocketState, WebSocketConfig } from '@/api/websocket'
import { queryKeys } from '@/api/queryKeys'
import type { Tick, TickSummary } from '@/api/types'
import { env } from '@/config/env'

/**
 * Hook configuration options
 */
export interface UseTickStreamOptions extends Partial<WebSocketConfig> {
  enabled?: boolean
  maxBufferSize?: number
  updateQueryCache?: boolean
  onTick?: (tick: Tick) => void
  onError?: (error: Error) => void
  onStateChange?: (state: WebSocketState) => void
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
const DEFAULT_OPTIONS: Required<Pick<UseTickStreamOptions, 'enabled' | 'maxBufferSize' | 'updateQueryCache'>> = {
  enabled: true,
  maxBufferSize: 100,
  updateQueryCache: true,
}

/**
 * React hook for WebSocket tick streaming
 */
export function useTickStream(options: UseTickStreamOptions = {}): UseTickStreamResult {
  const {
    enabled,
    maxBufferSize,
    updateQueryCache,
    onTick,
    onError,
    onStateChange,
    ...wsConfig
  } = { ...DEFAULT_OPTIONS, ...options }

  const queryClient = useQueryClient()
  const [ticks, setTicks] = useState<Tick[]>([])
  const [state, setState] = useState<WebSocketState>('disconnected')
  const [error, setError] = useState<Error | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  
  // Memoize wsConfig to prevent unnecessary effect runs
  const memoizedWsConfig = useMemo(() => wsConfig, [JSON.stringify(wsConfig)])
  
  const clientRef = useRef<TickStreamClient | null>(null)
  const ticksRef = useRef<Array<Tick>>([])
  const isUnmountedRef = useRef(false)
  
  // Store latest callbacks in refs to avoid stale closures
  const callbacksRef = useRef({ onTick, onError, onStateChange })
  useEffect(() => {
    callbacksRef.current = { onTick, onError, onStateChange }
  })

  /**
   * Handle incoming tick - stable reference using useCallback
   */
  const handleTick = useCallback((tick: Tick) => {
    if (isUnmountedRef.current) return
    
    // Add to buffer
    ticksRef.current = [tick, ...ticksRef.current].slice(0, maxBufferSize)
    setTicks([...ticksRef.current])

    // Update query cache if enabled
    if (updateQueryCache) {
      // Update recent ticks cache
      queryClient.setQueryData(
        queryKeys.ticks.recent({ limit: 10 }),
        (oldData: any) => {
          if (!oldData) return oldData

          const tickSummary: TickSummary = {
            tick_number: tick.tick_number,
            timestamp: tick.timestamp,
            transaction_count: tick.transaction_count,
          }

          const newTicks = [tickSummary, ...(oldData.ticks || [])]
            .filter((t, index, self) => 
              index === self.findIndex(existingTick => existingTick.tick_number === t.tick_number)
            )
            .sort((a, b) => b.tick_number - a.tick_number)
            .slice(0, oldData.ticks?.length || 10)

          return {
            ...oldData,
            ticks: newTicks,
            total: Math.max(oldData.total || 0, tick.tick_number),
          }
        }
      )

      // Update individual tick cache
      queryClient.setQueryData(
        queryKeys.ticks.detail(tick.tick_number),
        tick
      )
    }

    // Call user callback
    callbacksRef.current.onTick?.(tick)
  }, [maxBufferSize, updateQueryCache, queryClient])

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
  }, [memoizedWsConfig, handleTick, handleError, handleStateChange, handleReconnect])

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
    
    if (enabled && env.features.realTimeUpdates) {
      connect()
    }

    return () => {
      isUnmountedRef.current = true
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