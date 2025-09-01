/**
 * Shared utilities for Fermi Explorer monorepo
 * 
 * This package contains common utility functions used across
 * the frontend and backend applications.
 */

// Big number utilities
export * from './big-numbers'

// Formatters
export * from './formatters'

// Validation utilities
export * from './validation'

// Constants
export * from './constants'

// Re-export commonly used utilities with aliases
export {
  toBN,
  toSafeNumber,
  microsecondsToMilliseconds,
  calculateAgeFromMicroseconds,
  formatBigNumber,
} from './big-numbers'

export {
  formatNumber,
  formatBytes,
  formatRelativeTime,
  calculateTrend,
  numberFormatOptions,
} from './formatters'

export {
  validateTransactionHash,
  validateTickNumber,
  isValidTransactionHash,
  isValidTickNumber,
  sanitizeInput,
} from './validation'