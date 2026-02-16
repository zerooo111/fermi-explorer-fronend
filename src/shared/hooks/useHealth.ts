import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { StatusResponse } from '@/shared/types/api/health'
import { rollupRoutes } from '@/shared/lib/routes'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axios.get<StatusResponse>(rollupRoutes.STATUS)
      return response.data
    },
    refetchInterval: 5000,
  })
}
