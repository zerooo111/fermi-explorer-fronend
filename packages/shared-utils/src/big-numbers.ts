import BN from 'bn.js'

/**
 * Big number utilities for handling large integers safely
 * Uses bn.js to avoid JavaScript number precision issues
 */

// Constants for common operations
export const MICROSECONDS_TO_MILLISECONDS = new BN(1000)
export const MILLISECONDS_TO_SECONDS = new BN(1000)
export const MICROSECONDS_TO_SECONDS = new BN(1_000_000)

/**
 * Create a BN instance from various input types
 */
export function toBN(value: string | number | BN): BN {
  if (BN.isBN(value)) {
    return value
  }
  if (typeof value === 'string') {
    return new BN(value, 10)
  }
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
      throw new Error(`Unsafe number conversion: ${value}`)
    }
    return new BN(value)
  }
  throw new Error(`Cannot convert ${typeof value} to BN`)
}

/**
 * Safely convert BN to number for display (with overflow check)
 */
export function toSafeNumber(bn: BN): number {
  if (bn.gt(new BN(Number.MAX_SAFE_INTEGER))) {
    console.warn('Number exceeds safe integer limit, precision may be lost')
    return Number.MAX_SAFE_INTEGER
  }
  if (bn.lt(new BN(Number.MIN_SAFE_INTEGER))) {
    console.warn('Number below safe integer limit, precision may be lost')
    return Number.MIN_SAFE_INTEGER
  }
  return bn.toNumber()
}

/**
 * Convert microsecond timestamp to milliseconds for Date constructor
 */
export function microsecondsToMilliseconds(
  microseconds: string | number | BN,
): number {
  const microsecondsBN = toBN(microseconds)
  const millisecondsBN = microsecondsBN.div(MICROSECONDS_TO_MILLISECONDS)
  return toSafeNumber(millisecondsBN)
}

/**
 * Convert microsecond timestamp to seconds
 */
export function microsecondsToSeconds(
  microseconds: string | number | BN,
): number {
  const microsecondsBN = toBN(microseconds)
  const secondsBN = microsecondsBN.div(MICROSECONDS_TO_SECONDS)
  return toSafeNumber(secondsBN)
}

/**
 * Calculate age in seconds from microsecond timestamp
 */
export function calculateAgeFromMicroseconds(
  timestamp: string | number | BN,
): number {
  const timestampBN = toBN(timestamp)
  const nowMicroseconds = new BN(Date.now()).mul(MICROSECONDS_TO_MILLISECONDS)
  const ageMicroseconds = nowMicroseconds.sub(timestampBN)
  const ageSeconds = ageMicroseconds.div(MICROSECONDS_TO_SECONDS)
  return Math.max(0, toSafeNumber(ageSeconds))
}

/**
 * Calculate age in milliseconds from microsecond timestamp
 */
export function calculateAgeInMilliseconds(
  timestamp: string | number | BN,
): number {
  const timestampBN = toBN(timestamp)
  const nowMicroseconds = new BN(Date.now()).mul(MICROSECONDS_TO_MILLISECONDS)
  const ageMicroseconds = nowMicroseconds.sub(timestampBN)
  const ageMilliseconds = ageMicroseconds.div(MICROSECONDS_TO_MILLISECONDS)
  return Math.max(0, toSafeNumber(ageMilliseconds))
}

/**
 * Format a big number for display with thousand separators
 */
export function formatBigNumber(
  value: string | number | BN,
  options?: {
    maximumFractionDigits?: number
    minimumFractionDigits?: number
  },
): string {
  const num = toSafeNumber(toBN(value))
  return new Intl.NumberFormat('en-US', options).format(num)
}

/**
 * Compare two big numbers
 */
export function compareBN(
  a: string | number | BN,
  b: string | number | BN,
): number {
  const aBN = toBN(a)
  const bBN = toBN(b)

  if (aBN.gt(bBN)) return 1
  if (aBN.lt(bBN)) return -1
  return 0
}

/**
 * Add two big numbers
 */
export function addBN(a: string | number | BN, b: string | number | BN): BN {
  return toBN(a).add(toBN(b))
}

/**
 * Subtract two big numbers
 */
export function subtractBN(
  a: string | number | BN,
  b: string | number | BN,
): BN {
  return toBN(a).sub(toBN(b))
}

/**
 * Multiply two big numbers
 */
export function multiplyBN(
  a: string | number | BN,
  b: string | number | BN,
): BN {
  return toBN(a).mul(toBN(b))
}

/**
 * Divide two big numbers (integer division)
 */
export function divideBN(a: string | number | BN, b: string | number | BN): BN {
  return toBN(a).div(toBN(b))
}

/**
 * Check if a value is a safe number (within JavaScript's safe integer range)
 */
export function isSafeNumber(value: string | number | BN): boolean {
  const bn = toBN(value)
  return (
    bn.lte(new BN(Number.MAX_SAFE_INTEGER)) &&
    bn.gte(new BN(Number.MIN_SAFE_INTEGER))
  )
}

/**
 * Get the string representation of a big number
 */
export function bnToString(value: string | number | BN): string {
  return toBN(value).toString(10)
}

/**
 * Convert a big number to hex string
 */
export function bnToHex(value: string | number | BN): string {
  return toBN(value).toString(16)
}