/**
 * Base API response types
 */

/**
 * Base response interface that includes pagination metadata
 */
export interface BaseResponse {
  found?: boolean
}

/**
 * Error response format
 */
export interface ApiErrorResponse {
  error: string
}

/**
 * Wrapped response format for detail endpoints
 * New API format wraps responses in success/data structure
 */
export interface WrappedResponse<T> {
  success: boolean
  data: T
}
