import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { TransactionResponse } from '../api/types'

export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => apiClient.get<TransactionResponse>(`/api/v1/tx/${hash}`),
    enabled: !!hash,
  })
}