/**
 * Shared types for Continuum Explorer monorepo
 * 
 * This package contains all shared TypeScript interfaces and types
 * used across the frontend and backend applications.
 */

// API types
export * from './api'

// Validation types  
export * from './validation'

// Re-export commonly used types with aliases for convenience
export type {
  BaseResponse,
  HealthResponse,
  StatusResponse,
  TransactionData,
  TransactionResponse,
  TickData,
  Tick,
  TickResponse,
  TickSummary,
  RecentTicksResponse,
  WebSocketMessage,
  WebSocketState,
} from './api'

export type {
  ValidationError,
  ErrorResponse,
  RequestLimits,
  TickValidationResult,
} from './validation'