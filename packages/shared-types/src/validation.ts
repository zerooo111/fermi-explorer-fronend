/**
 * Shared validation types and interfaces
 */

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string
  message?: string
  errors?: ValidationError[]
  timestamp: number
  request_id?: string
}

/**
 * Request limits and constraints
 */
export interface RequestLimits {
  maxRequestSize: number
  maxResponseSize: number
  timeout: number
  maxTickNumber: bigint
  maxRecentTicks: number
}

/**
 * Validation result for tick numbers
 */
export interface TickValidationResult {
  value: bigint
  error?: ValidationError
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  TRANSACTION_HASH: /^[a-fA-F0-9]{8}$/,
  HEX_STRING: /^[a-fA-F0-9]+$/,
} as const

/**
 * Validation error codes
 */
export const ValidationErrorCodes = {
  REQUIRED: 'required',
  INVALID_FORMAT: 'invalid_format',
  OUT_OF_RANGE: 'out_of_range',
  TOO_LARGE: 'too_large',
  TOO_SMALL: 'too_small',
} as const

/**
 * HTTP status codes for common errors
 */
export const HttpStatusCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const