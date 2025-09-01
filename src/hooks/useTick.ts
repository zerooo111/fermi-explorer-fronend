import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { TickResponse, RecentTicksResponse } from '../types/shared/api'
import { getApiUrl } from '@/lib/api'

export function useTick(tickNumber: number) {
  return useQuery({
    queryKey: ['tick', tickNumber],
    queryFn: async () => {
      const response = await axios.get<TickResponse>(getApiUrl(`/api/v1/tick/${tickNumber}`))
      return response.data
    },
    enabled: !!tickNumber && tickNumber > 0,
  })
}

export function useRecentTicks(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-ticks', limit],
    queryFn: async () => {
      const response = await axios.get<RecentTicksResponse>(getApiUrl(`/api/v1/ticks?limit=${limit}`))
      return response.data
    },
    refetchInterval: 1000,
  })
}