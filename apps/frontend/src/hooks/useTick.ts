import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { TickResponse, RecentTicksResponse } from '../api/types'

export function useTick(tickNumber: number) {
  return useQuery({
    queryKey: ['tick', tickNumber],
    queryFn: () => apiClient.get<TickResponse>(`/api/v1/tick/${tickNumber}`),
    enabled: !!tickNumber && tickNumber > 0,
  })
}

export function useRecentTicks(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-ticks', limit],
    queryFn: () => apiClient.get<RecentTicksResponse>(`/api/v1/ticks?limit=${limit}`),
    refetchInterval: 1000,
  })
}