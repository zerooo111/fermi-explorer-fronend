import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { TransactionResponse } from '@/shared/types/shared/api'
import { continuumRoutes } from '@/shared/lib/routes'

export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: async () => {
      const response = await axios.get<TransactionResponse>(continuumRoutes.TX(hash))
      return response.data
    },
    enabled: !!hash,
  })
}