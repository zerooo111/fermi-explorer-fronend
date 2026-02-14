/**
 * Shared API layer
 *
 * Provides centralized API client and query configuration.
 */

export { createApiClient, getApiClient, resetApiClient } from './client'
export { createQueryClient, getQueryClient, resetQueryClient, DEFAULT_QUERY_OPTIONS } from './queryClient'
