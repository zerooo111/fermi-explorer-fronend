import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { HealthResponse } from '@fermi/shared-types/api'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axios.get<HealthResponse>('/api/v1/health')
      return response.data
    },
    refetchInterval: 5000,
  })
}
