import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { TickResponse, RecentTicksResponse } from '@/shared/types/shared/api'
import { API_ROUTES } from '@/features/continuum/api/routes'

export function useTick(tickNumber: number) {
  return useQuery({
    queryKey: ['tick', tickNumber],
    queryFn: async () => {
      const response = await axios.get<TickResponse>(API_ROUTES.TICK(tickNumber))
      return response.data
    },
    enabled: !!tickNumber && tickNumber > 0,
  })
}

export function useRecentTicks(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-ticks', limit],
    queryFn: async () => {
      const response = await axios.get<RecentTicksResponse>(API_ROUTES.TICKS({ limit }))
      return response.data
    },
    refetchInterval: 1000,
  })
}