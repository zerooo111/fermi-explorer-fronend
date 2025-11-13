import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { TransactionResponse } from '@/shared/types/shared/api'
import { API_ROUTES } from '@/features/continuum/api/routes'

export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: async () => {
      const response = await axios.get<TransactionResponse>(API_ROUTES.TX(hash))
      return response.data
    },
    enabled: !!hash,
  })
}