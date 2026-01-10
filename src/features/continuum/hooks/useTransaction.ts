import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { TransactionResponse, ContinuumTransaction, ContinuumRecentTransactionsResponse, WrappedResponse } from '@/shared/types/shared/api'
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

/**
 * Fetch a transaction by ID or hash using the new Continuum API
 * GET /api/v1/continuum/txn/{txnId}
 * Response is wrapped in { success, data } structure
 * @param txnId - Transaction ID (tx_id) or hash (tx_hash)
 */
export function useContinuumTransaction(txnId: string) {
  return useQuery({
    queryKey: ['continuum-txn', txnId],
    queryFn: async () => {
      const response = await axios.get<WrappedResponse<ContinuumTransaction>>(continuumRoutes.TXN(txnId))
      // Unwrap the response - new API wraps data in { success, data }
      return response.data.data
    },
    enabled: !!txnId,
  })
}

/**
 * Fetch recent transactions using the new Continuum API
 * GET /api/v1/continuum/txn/recent?limit={limit}
 * @param limit - Number of transactions to fetch (default: 50, max: 1000)
 */
export function useContinuumRecentTransactions(limit: number = 50) {
  return useQuery({
    queryKey: ['continuum-txn-recent', limit],
    queryFn: async () => {
      const response = await axios.get<ContinuumRecentTransactionsResponse>(continuumRoutes.RECENT_TXN(limit))
      return response.data
    },
    refetchInterval: 3000,
  })
}