/**
 * Continuum Feature Hooks
 *
 * Consolidated hooks for querying and managing Continuum data.
 * All hooks use the unified entities layer and follow React Query best practices.
 */

import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getApiClient } from '@/shared/api/client'
import type { WrappedResponse } from '@/shared/types/api'
import type {
  Tick,
  WebSocketState,
  ContinuumTransaction,
  RecentTicksResponse,
  ContinuumRecentTransactionsResponse,
} from '@/shared/types/shared/api'
import { continuumRoutes } from '@/shared/lib/routes'
import { TickStreamClient } from './websocket'
import type { WebSocketConfig } from './websocket'
import { queryKeys } from './queryKeys'

/**
 * Fetch a tick by number
 */
export function useTick(
  tickNumber: number,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: queryKeys.ticks.detail(tickNumber),
    queryFn: async () => {
      const response = await client.get(continuumRoutes.TICK(tickNumber))
      return response.data
    },
    enabled: !!tickNumber && tickNumber > 0,
    ...options,
  })
}

/**
 * Fetch a tick by number using the new Continuum API
 * GET /api/v1/continuum/tick/{tickNumber}
 */
export function useContinuumTick(
  tickNumber: number,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: queryKeys.ticks.detail(tickNumber),
    queryFn: async () => {
      const response = await client.get<WrappedResponse<Tick>>(
        continuumRoutes.TICK(tickNumber),
      )
      return response.data.data
    },
    enabled: !!tickNumber && tickNumber > 0,
    ...options,
  })
}

/**
 * Fetch recent ticks
 */
export function useRecentTicks(
  limit: number = 10,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: queryKeys.ticks.recent({ limit }),
    queryFn: async () => {
      const response = await client.get<RecentTicksResponse>(
        continuumRoutes.TICKS({ limit }),
      )
      return response.data
    },
    refetchInterval: 1000,
    ...options,
  })
}

/**
 * Fetch a transaction by hash
 */
export function useTransaction(
  hash: string,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: queryKeys.transactions.detail(hash),
    queryFn: async () => {
      const response = await client.get(continuumRoutes.TX(hash))
      return response.data
    },
    enabled: !!hash,
    ...options,
  })
}

/**
 * Fetch a transaction by ID or hash using the new Continuum API
 * GET /api/v1/continuum/txn/{txnId}
 */
export function useContinuumTransaction(
  txnId: string,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: queryKeys.transactions.detail(txnId),
    queryFn: async () => {
      const response = await client.get<WrappedResponse<ContinuumTransaction>>(
        continuumRoutes.TXN(txnId),
      )
      return response.data.data
    },
    enabled: !!txnId,
    ...options,
  })
}

/**
 * Fetch recent transactions using the new Continuum API
 */
export function useContinuumRecentTransactions(
  limit: number = 50,
  options?: Partial<UseQueryOptions>,
) {
  const client = getApiClient()

  return useQuery({
    queryKey: queryKeys.transactions.all(),
    queryFn: async () => {
      const response = await client.get<ContinuumRecentTransactionsResponse>(
        continuumRoutes.RECENT_TXN(limit),
      )
      return response.data
    },
    refetchInterval: 3000,
    ...options,
  })
}

/**
 * Hook configuration options for tick streaming
 */
export interface UseTickStreamOptions extends Partial<WebSocketConfig> {
  enabled?: boolean
  maxBufferSize?: number
  onTick?: (tick: Tick) => void
  onError?: (error: Error) => void
  onStateChange?: (state: WebSocketState) => void
  displayLimit?: number
}

/**
 * Hook return value for tick streaming
 */
export interface UseTickStreamResult {
  ticks: Tick[]
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
 * React hook for WebSocket tick streaming
 */
export function useTickStream(
  options: UseTickStreamOptions = {},
): UseTickStreamResult {
  const {
    enabled = true,
    maxBufferSize = 10,
    displayLimit = 20,
    onTick,
    onError,
    onStateChange,
    ...wsConfig
  } = options

  const [ticks, setTicks] = useState<Tick[]>([])
  const [state, setState] = useState<WebSocketState>('disconnected')
  const [error, setError] = useState<Error | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

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
  const ticksRef = useRef<Tick[]>([])
  const rafRef = useRef<number | null>(null)
  const pendingTicksRef = useRef<Tick[]>([])
  const isUnmountedRef = useRef(false)

  const callbacksRef = useRef({ onTick, onError, onStateChange })
  useEffect(() => {
    callbacksRef.current = { onTick, onError, onStateChange }
  })

  const processPendingTicks = useCallback(() => {
    if (isUnmountedRef.current || pendingTicksRef.current.length === 0) {
      rafRef.current = null
      return
    }

    const memoryLimit = displayLimit || 20
    const newTicks = [...pendingTicksRef.current]
    pendingTicksRef.current = []

    let updated = false
    newTicks.forEach((tick) => {
      const currentNewest = ticksRef.current[0]
      if (!currentNewest || tick.tick_number > currentNewest.tick_number) {
        ticksRef.current = [tick, ...ticksRef.current].slice(0, memoryLimit)
        updated = true
        callbacksRef.current.onTick?.(tick)
      }
    })

    if (updated) {
      setTicks([...ticksRef.current])
    }

    rafRef.current = null
  }, [displayLimit])

  const handleTick = useCallback(
    (tick: Tick) => {
      if (isUnmountedRef.current) return
      pendingTicksRef.current.push(tick)

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processPendingTicks)
      }
    },
    [processPendingTicks],
  )

  const handleError = useCallback((err: Error) => {
    if (isUnmountedRef.current) return
    setError(err)
    callbacksRef.current.onError?.(err)
  }, [])

  const handleStateChange = useCallback((newState: WebSocketState) => {
    if (isUnmountedRef.current) return
    setState(newState)
    callbacksRef.current.onStateChange?.(newState)

    if (newState === 'connected') {
      setError(null)
      setReconnectAttempt(0)
    }
  }, [])

  const handleReconnect = useCallback((attempt: number) => {
    if (isUnmountedRef.current) return
    setReconnectAttempt(attempt)
  }, [])

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

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }
  }, [])

  const clearTicks = useCallback(() => {
    if (isUnmountedRef.current) return
    ticksRef.current = []
    setTicks([])
  }, [])

  useEffect(() => {
    isUnmountedRef.current = false

    if (enabled) {
      connect()
    }

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
