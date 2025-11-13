import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { HealthResponse } from '@/shared/types/shared/api'
import { continuumRoutes } from '@/shared/lib/routes'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axios.get<HealthResponse>(continuumRoutes.HEALTH)
      return response.data
    },
    refetchInterval: 5000,
  })
}
