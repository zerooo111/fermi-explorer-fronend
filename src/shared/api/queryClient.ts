/**
 * TanStack Query (React Query) Client Configuration
 *
 * Centralizes all query client configuration and default settings.
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Create and configure the Query Client
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache successful responses for 30 seconds by default
        staleTime: 30 * 1000,
        // Keep unused queries in cache for 2 minutes
        gcTime: 2 * 60 * 1000,
        // Don't retry on failure by default
        retry: 0,
        // Enable automatic refetch on window focus
        refetchOnWindowFocus: false,
        // Enable automatic refetch when reconnecting
        refetchOnReconnect: true,
      },
      mutations: {
        // Don't retry mutations by default
        retry: 0,
      },
    },
  })
}

/**
 * Default query options for frequently accessed data
 */
export const DEFAULT_QUERY_OPTIONS = {
  // Real-time data (update every second)
  REAL_TIME: {
    staleTime: 1 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 1000,
    refetchIntervalInBackground: false,
  },
  // Frequently accessed data
  FREQUENT: {
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 10000,
  },
  // Standard data
  STANDARD: {
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  // Rarely changing data
  STATIC: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
}

/**
 * Query client singleton
 */
let queryClient: QueryClient | null = null

/**
 * Get or create the Query Client singleton
 */
export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = createQueryClient()
  }
  return queryClient
}

/**
 * Reset the Query Client (useful for testing)
 */
export function resetQueryClient(): void {
  if (queryClient) {
    queryClient.clear()
    queryClient = null
  }
}

export default getQueryClient()
