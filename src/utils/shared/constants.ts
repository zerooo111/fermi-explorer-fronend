/**
 * Shared constants for Fermi Explorer
 */

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  defaultStaleTime: 5 * 60 * 1000, // 5 minutes
  defaultCacheTime: 10 * 60 * 1000, // 10 minutes
} as const

/**
 * WebSocket configuration
 */
export const WEBSOCKET_CONFIG = {
  reconnectInterval: 3000, // 3 seconds
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000, // 30 seconds
  messageQueueLimit: 100,
} as const

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  TRANSACTION_HASH: /^[a-fA-F0-9]{8}$/,
  HEX_STRING: /^[a-fA-F0-9]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const

/**
 * Error codes
 */
export const ERROR_CODES = {
  REQUIRED: 'required',
  INVALID_FORMAT: 'invalid_format',
  OUT_OF_RANGE: 'out_of_range',
  TOO_LARGE: 'too_large',
  TOO_SMALL: 'too_small',
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
} as const

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
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

/**
 * Time constants
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const

/**
 * Size constants
 */
export const SIZE = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const

/**
 * Default pagination
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const