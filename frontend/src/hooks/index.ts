/**
 * Continuum Sequencer Data Hooks
 *
 * Barrel export file for all TanStack Query data provider hooks.
 * Provides a clean interface for importing hooks throughout the application.
 */

// Health monitoring hooks
export { useHealth, type UseHealthOptions } from './useHealth'

// Status and metrics hooks
export {
  useStatus,
  useSimpleStatus,
  useRealTimeMetrics,
  type UseStatusOptions,
  type PerformanceMetrics,
} from './useStatus'

// Transaction lookup hooks
export {
  useTransaction,
  useTransactionSearch,
  useTransactionHistory,
  type UseTransactionOptions,
  type TransactionResult,
} from './useTransaction'

// Tick lookup and navigation hooks
export {
  useTick,
  useTickNavigation,
  useTickRange,
  type UseTickOptions,
  type TickResult,
} from './useTick'

// Recent ticks and pagination hooks
export {
  useRecentTicks,
  useInfiniteRecentTicks,
  useTickMonitor,
  type UseRecentTicksOptions,
  type RecentTicksResult,
} from './useRecentTicks'

// WebSocket tick streaming hooks
export {
  useTickStream,
  useLatestTick,
  useTickCount,
  type UseTickStreamOptions,
  type UseTickStreamResult,
} from './useTickStream'

// Re-export types and utilities from API layer
export type {
  // Core API types
  HealthResponse,
  StatusResponse,
  TransactionResponse,
  TransactionData,
  TickResponse,
  TickData,
  Tick,
  RecentTicksResponse,
  TickSummary,

  // Enhanced types
  EnhancedTransactionData,
  EnhancedTickData,
  EnhancedTickSummary,
  ConvertedTimestamp,

  // Parameter types
  RecentTicksParams,
  TransactionSearchParams,
  TickSearchParams,

  // Configuration types
  QueryOptions,
  ApiConfiguration,
  QueryState,
  MutationState,

  // Utility types
  BaseResponse,
  ApiErrorResponse,
} from '../api/types'

// Re-export API utilities
export {
  // Type guards
  hasData,
  hasTransactionData,
  hasTickData,

  // Validation helpers
  isValidTransactionHash,
  isValidTickNumber,

  // Data transformation utilities
  convertTimestamp,
  calculateAge,
  enhanceTransactionData,
  enhanceTickData,
  enhanceTickSummary,
  formatBytes,
} from '../api/types'

// Re-export query keys for advanced usage
export {
  queryKeys,
  queryKeyUtils,
  cacheConfig,
  retryConfig,
  queryMatchers,
  cacheInvalidation,
} from '../api/queryKeys'

// Re-export API client for advanced usage
export {
  apiClient,
  createApiClient,
  isApiError,
  isNetworkError,
  ApiError,
  NetworkError,
  type ApiConfig,
} from '../api/client'
