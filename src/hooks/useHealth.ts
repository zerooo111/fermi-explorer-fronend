import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { HealthResponse } from '../types/shared/api'
import { API_ROUTES } from '@/api/routes'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axios.get<HealthResponse>(API_ROUTES.HEALTH)
      return response.data
    },
    refetchInterval: 5000,
  })
}
