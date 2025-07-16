/**
 * TypeScript interfaces for Continuum Sequencer API
 * 
 * Complete type definitions for all REST API endpoints based on the API reference.
 * Designed for type safety and developer experience with TanStack Query.
 */

/**
 * Base response interface that includes pagination metadata
 */
export interface BaseResponse {
  found?: boolean;
}

/**
 * Error response format
 */
export interface ApiErrorResponse {
  error: string;
}

/**
 * Health check endpoint response
 * GET /api/v1/health
 */
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: number; // Unix timestamp in seconds
}

/**
 * Sequencer status endpoint response
 * GET /api/v1/status
 */
export interface StatusResponse {
  chain_height: number;
  total_transactions: number;
  latest_tick: number;
  status: string; // "running" when operational
}

/**
 * Transaction data structure as returned in API responses
 */
export interface TransactionData {
  tx_id: string; // Hex-encoded original transaction ID
  nonce: number;
  ingestion_timestamp: number; // Microseconds since Unix epoch
  payload_size: number; // Size in bytes
}

/**
 * Transaction lookup endpoint response
 * GET /api/v1/tx/{hash}
 */
export interface TransactionResponse extends BaseResponse {
  tx_hash?: string; // 8-character hex hash
  tick_number?: number;
  sequence_number?: number;
  found: boolean;
  transaction?: TransactionData;
}

/**
 * Detailed tick information
 */
export interface TickData {
  tick_number: number;
  timestamp: number; // Microseconds since Unix epoch
  transaction_count: number;
  transaction_batch_hash: string; // Hex-encoded hash
  vdf_iterations: number;
  previous_output: string; // Hex-encoded VDF output
}

/**
 * Full tick information from WebSocket stream
 */
export interface Tick {
  tick_number: number;
  timestamp: number; // Microseconds since Unix epoch
  transaction_count: number;
  transaction_batch_hash: string;
  previous_output: string;
  vdf_proof: {
    input: string;
    output: string;
    proof: string;
    iterations: number;
  };
  transactions: Array<{
    tx_id: string;
    sequence_number: number;
    nonce: number;
    ingestion_timestamp: number;
    payload_size: number;
  }>;
}

/**
 * Tick lookup endpoint response
 * GET /api/v1/tick/{number}
 */
export interface TickResponse extends BaseResponse {
  tick_number?: number;
  found: boolean;
  tick?: TickData;
}

/**
 * Simplified tick summary for listings
 */
export interface TickSummary {
  tick_number: number;
  timestamp: number; // Microseconds since Unix epoch
  transaction_count: number;
}

/**
 * Recent ticks endpoint response
 * GET /api/v1/ticks/recent
 */
export interface RecentTicksResponse {
  ticks: TickSummary[];
  total: number; // Number of ticks returned (not total in system)
}

/**
 * Query parameters for recent ticks endpoint
 */
export interface RecentTicksParams {
  limit?: number; // Default: 20, Max: 100
  offset?: number; // Default: 0
}

/**
 * Utility types for data transformations
 */

/**
 * Converted timestamp (JavaScript Date-friendly)
 */
export interface ConvertedTimestamp {
  microseconds: number; // Original microsecond timestamp
  milliseconds: number; // Converted to milliseconds for JS Date
  date: Date; // JavaScript Date object
  formatted: string; // Locale-formatted string
}

/**
 * Enhanced transaction data with converted timestamps
 */
export interface EnhancedTransactionData extends TransactionData {
  ingestion_time: ConvertedTimestamp;
  decoded_tx_id?: string; // Decoded from hex if applicable
}

/**
 * Enhanced tick data with converted timestamps
 */
export interface EnhancedTickData extends TickData {
  tick_time: ConvertedTimestamp;
  age_seconds: number; // Age in seconds from now
}

/**
 * Enhanced tick summary with converted timestamps
 */
export interface EnhancedTickSummary extends TickSummary {
  tick_time: ConvertedTimestamp;
  age_seconds: number;
}

/**
 * Query options for customizing API behavior
 */
export interface QueryOptions {
  /**
   * Override default stale time for this query
   */
  staleTime?: number;
  
  /**
   * Override default cache time for this query
   */
  cacheTime?: number;
  
  /**
   * Enable/disable background refetch
   */
  refetchInBackground?: boolean;
  
  /**
   * Polling interval in milliseconds
   */
  pollInterval?: number;
  
  /**
   * Retry configuration
   */
  retry?: boolean | number | ((failureCount: number, error: unknown) => boolean);
}

/**
 * Pagination state for list endpoints
 */
export interface PaginationState {
  limit: number;
  offset: number;
  hasMore: boolean;
  total?: number;
}

/**
 * Search parameters for transaction lookup
 */
export interface TransactionSearchParams {
  hash: string; // 8-character hex hash
  validateFormat?: boolean; // Whether to validate hash format before query
}

/**
 * Search parameters for tick lookup
 */
export interface TickSearchParams {
  tickNumber: number;
  includeTransactions?: boolean; // Future enhancement flag
}

/**
 * Real-time data subscription options
 */
export interface SubscriptionOptions {
  /**
   * Polling interval for real-time updates
   */
  interval?: number;
  
  /**
   * Enable optimistic updates
   */
  optimistic?: boolean;
  
  /**
   * Callback for real-time updates
   */
  onUpdate?: (data: unknown) => void;
  
  /**
   * Auto-start subscription
   */
  autoStart?: boolean;
}

/**
 * API client configuration
 */
export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  retries: number;
  defaultStaleTime: number;
  defaultCacheTime: number;
}

/**
 * Cache management types
 */
export interface CacheKey {
  scope: string;
  entity: string;
  params?: Record<string, unknown>;
}

/**
 * Query state information
 */
export interface QueryState<T = unknown> {
  data?: T;
  error?: Error;
  isLoading: boolean;
  isFetching: boolean;
  isStale: boolean;
  lastUpdated?: Date;
}

/**
 * Mutation state information
 */
export interface MutationState<T = unknown> {
  data?: T;
  error?: Error;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Utility type guards
 */

/**
 * Type guard for checking if response has data
 */
export const hasData = <T extends BaseResponse>(
  response: T
): response is T & { found: true } => {
  return response.found === true;
};

/**
 * Type guard for transaction response with data
 */
export const hasTransactionData = (
  response: TransactionResponse
): response is TransactionResponse & { 
  found: true; 
  tx_hash: string; 
  tick_number: number; 
  sequence_number: number; 
  transaction: TransactionData;
} => {
  return response.found === true && 
         response.transaction !== undefined &&
         response.tx_hash !== undefined &&
         response.tick_number !== undefined &&
         response.sequence_number !== undefined;
};

/**
 * Type guard for tick response with data
 */
export const hasTickData = (
  response: TickResponse
): response is TickResponse & { 
  found: true; 
  tick_number: number; 
  tick: TickData;
} => {
  return response.found === true && 
         response.tick !== undefined &&
         response.tick_number !== undefined;
};

/**
 * Validation helpers
 */

/**
 * Validate transaction hash format
 */
export const isValidTransactionHash = (hash: string): boolean => {
  return /^[a-fA-F0-9]{8}$/.test(hash);
};

/**
 * Validate tick number
 */
export const isValidTickNumber = (tickNumber: number): boolean => {
  return Number.isInteger(tickNumber) && tickNumber > 0;
};

/**
 * Utility functions for data transformation
 */

/**
 * Convert microsecond timestamp to ConvertedTimestamp
 */
export const convertTimestamp = (microseconds: number): ConvertedTimestamp => {
  const milliseconds = Math.floor(microseconds / 1000);
  const date = new Date(milliseconds);
  
  return {
    microseconds,
    milliseconds,
    date,
    formatted: date.toLocaleString(),
  };
};

/**
 * Calculate age in seconds from timestamp
 */
export const calculateAge = (timestamp: number): number => {
  const now = Date.now() * 1000; // Convert to microseconds
  return Math.floor((now - timestamp) / 1_000_000); // Convert to seconds
};

/**
 * Enhance transaction data with computed fields
 */
export const enhanceTransactionData = (transaction: TransactionData): EnhancedTransactionData => {
  return {
    ...transaction,
    ingestion_time: convertTimestamp(transaction.ingestion_timestamp),
    decoded_tx_id: tryDecodeHex(transaction.tx_id),
  };
};

/**
 * Enhance tick data with computed fields
 */
export const enhanceTickData = (tick: TickData): EnhancedTickData => {
  return {
    ...tick,
    tick_time: convertTimestamp(tick.timestamp),
    age_seconds: calculateAge(tick.timestamp),
  };
};

/**
 * Enhance tick summary with computed fields
 */
export const enhanceTickSummary = (tick: TickSummary): EnhancedTickSummary => {
  return {
    ...tick,
    tick_time: convertTimestamp(tick.timestamp),
    age_seconds: calculateAge(tick.timestamp),
  };
};

/**
 * Try to decode hex string to UTF-8 (if applicable)
 */
const tryDecodeHex = (hex: string): string | undefined => {
  try {
    return decodeURIComponent(
      hex.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&')
    );
  } catch {
    return undefined; // Not valid UTF-8
  }
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};