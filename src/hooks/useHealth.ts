import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { HealthResponse } from '../types/shared/api'
import { getApiUrl } from '@/lib/api'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axios.get<HealthResponse>(getApiUrl(`/api/v1/health`))
      return response.data
    },
    refetchInterval: 5000,
  })
}
