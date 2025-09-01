/**
 * TanStack Query Provider Configuration (Simplified for MVP)
 */

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AxiosError } from 'axios'

/**
 * Create and configure the QueryClient instance
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global query defaults
        staleTime: 30000, // 30 seconds
        gcTime: 300000, // 5 minutes
        
        // Error handling
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (except 429)
          if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
            return false
          }
          // Retry up to 3 times with exponential backoff
          return failureCount < 3
        },
        
        // Background refetching
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        // Global mutation defaults
        retry: false,
      },
    },
  })
}

/**
 * Global QueryClient instance
 */
export const queryClient = createQueryClient()

/**
 * Query Provider Component
 */
interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}