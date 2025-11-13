import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { TickResponse, RecentTicksResponse } from '@/shared/types/shared/api'
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