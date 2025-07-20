import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { HealthResponse } from '../api/types'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get<HealthResponse>('/api/v1/health'),
    refetchInterval: 5000,
  })
}
