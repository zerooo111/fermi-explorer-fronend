import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { TransactionResponse } from '@fermi/shared-types/api'

export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: async () => {
      const response = await axios.get<TransactionResponse>(`/api/v1/tx/${hash}`)
      return response.data
    },
    enabled: !!hash,
  })
}