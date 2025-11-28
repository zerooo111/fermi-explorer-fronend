import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { TickResponse, RecentTicksResponse, ContinuumTick } from '@/shared/types/shared/api'
import { continuumRoutes } from '@/shared/lib/routes'

export function useTick(tickNumber: number) {
  return useQuery({
    queryKey: ['tick', tickNumber],
    queryFn: async () => {
      const response = await axios.get<TickResponse>(continuumRoutes.TICK(tickNumber))
      return response.data
    },
    enabled: !!tickNumber && tickNumber > 0,
  })
}

/**
 * Fetch a tick by number using the new Continuum API
 * GET /api/v1/continuum/tick/{tickNumber}
 */
export function useContinuumTick(tickNumber: number) {
  return useQuery({
    queryKey: ['continuum-tick', tickNumber],
    queryFn: async () => {
      const response = await axios.get<ContinuumTick>(continuumRoutes.TICK(tickNumber))
      return response.data
    },
    enabled: !!tickNumber && tickNumber > 0,
  })
}

export function useRecentTicks(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-ticks', limit],
    queryFn: async () => {
      const response = await axios.get<RecentTicksResponse>(continuumRoutes.TICKS({ limit }))
      return response.data
    },
    refetchInterval: 1000,
  })
}