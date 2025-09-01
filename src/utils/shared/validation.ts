/**
 * Local validation error structure (mirrored from shared-types)
 */
interface ValidationError {
  field: string
  message: string
  code: string
}

export interface RequestLimits {
  maxRequestSize: number
  maxResponseSize: number
  timeout: number
  maxTickNumber: bigint
  maxRecentTicks: number
}

/**
 * Shared validation utilities for Fermi Explorer
 */

/**
 * Default request limits
 */
export const DEFAULT_LIMITS: RequestLimits = {
  maxRequestSize: 1024 * 1024, // 1MB
  maxResponseSize: 10 * 1024 * 1024, // 10MB
  timeout: 30000, // 30 seconds
  maxTickNumber: 1000000000n, // 1 billion
  maxRecentTicks: 1000,
}

/**
 * Validate transaction hash format
 */
export function validateTransactionHash(hash: string): ValidationError | null {
  if (!hash) {
    return {
      field: 'hash',
      message: 'Transaction hash is required',
      code: 'required'
    }
  }

  if (!/^[a-fA-F0-9]{8}$/.test(hash)) {
    return {
      field: 'hash',
      message: 'Transaction hash must be exactly 8 hexadecimal characters',
      code: 'invalid_format'
    }
  }

  return null
}

/**
 * Validate tick number
 */
export function validateTickNumber(tickStr: string, limits = DEFAULT_LIMITS): { value: bigint; error?: ValidationError } {
  if (!tickStr) {
    return {
      value: 0n,
      error: {
        field: 'number',
        message: 'Tick number is required',
        code: 'required'
      }
    }
  }

  let tickNum: bigint
  try {
    tickNum = BigInt(tickStr)
  } catch {
    return {
      value: 0n,
      error: {
        field: 'number',
        message: 'Tick number must be a valid positive integer',
        code: 'invalid_format'
      }
    }
  }

  if (tickNum < 0n) {
    return {
      value: 0n,
      error: {
        field: 'number',
        message: 'Tick number must be positive',
        code: 'invalid_format'
      }
    }
  }

  if (tickNum > limits.maxTickNumber) {
    return {
      value: 0n,
      error: {
        field: 'number',
        message: `Tick number must not exceed ${limits.maxTickNumber}`,
        code: 'out_of_range'
      }
    }
  }

  return { value: tickNum }
}

/**
 * Validate query parameters for pagination
 */
export function validatePaginationParams(
  limitStr?: string,
  offsetStr?: string,
  limits = DEFAULT_LIMITS
): ValidationError[] {
  const errors: ValidationError[] = []

  // Validate limit parameter
  if (limitStr) {
    const limit = parseInt(limitStr, 10)
    if (isNaN(limit)) {
      errors.push({
        field: 'limit',
        message: 'Limit must be a valid integer',
        code: 'invalid_format'
      })
    } else if (limit < 1) {
      errors.push({
        field: 'limit',
        message: 'Limit must be greater than 0',
        code: 'out_of_range'
      })
    } else if (limit > limits.maxRecentTicks) {
      errors.push({
        field: 'limit',
        message: `Limit must not exceed ${limits.maxRecentTicks}`,
        code: 'out_of_range'
      })
    }
  }

  // Validate offset parameter
  if (offsetStr) {
    let offset: bigint
    try {
      offset = BigInt(offsetStr)
    } catch {
      errors.push({
        field: 'offset',
        message: 'Offset must be a valid non-negative integer',
        code: 'invalid_format'
      })
      return errors
    }

    if (offset < 0n) {
      errors.push({
        field: 'offset',
        message: 'Offset must be non-negative',
        code: 'invalid_format'
      })
    } else if (offset > limits.maxTickNumber) {
      errors.push({
        field: 'offset',
        message: `Offset must not exceed ${limits.maxTickNumber}`,
        code: 'out_of_range'
      })
    }
  }

  return errors
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\x00/g, '')
}

/**
 * Check if transaction hash format is valid
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^[a-fA-F0-9]{8}$/.test(hash)
}

/**
 * Check if tick number is valid
 */
export function isValidTickNumber(tickNumber: number): boolean {
  return Number.isInteger(tickNumber) && tickNumber > 0
}

/**
 * Validate hex string format
 */
export function isValidHexString(hex: string): boolean {
  return /^[a-fA-F0-9]+$/.test(hex)
}

/**
 * Try to decode hex string to UTF-8
 */
export function tryDecodeHex(hex: string): string | undefined {
  try {
    return decodeURIComponent(
      hex.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'),
    )
  } catch {
    return undefined // Not valid UTF-8
  }
}