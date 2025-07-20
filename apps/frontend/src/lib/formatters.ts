/**
 * Frontend formatters - re-exports from shared utilities with additional frontend-specific formatters
 */

// Re-export shared utilities
export * from '@fermi/shared-utils/formatters'

// Frontend-specific formatters can be added here if needed

export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return 'N/A'
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function formatRelativeTime(seconds: number | undefined): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return 'N/A'
  
  if (seconds < 60) {
    return `${Math.floor(seconds)}s ago`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`
  } else {
    return `${Math.floor(seconds / 86400)}d ago`
  }
}

export function convertTimestamp(microseconds: number): Date {
  return new Date(microseconds / 1000)
}

export function calculateAge(timestamp: number): number {
  const now = Date.now()
  const timestampMs = timestamp / 1000
  return Math.floor((now - timestampMs) / 1000)
}

// Import big number utilities for safe calculations
import { calculateAgeFromMicroseconds, microsecondsToMilliseconds, toSafeNumber, toBN } from './bigNumbers'

export function calculateAgeFromMicroTimestamp(timestamp: string | number): number {
  return calculateAgeFromMicroseconds(timestamp)
}

export function convertMicroTimestampToDate(timestamp: string | number): Date {
  const milliseconds = microsecondsToMilliseconds(timestamp)
  return new Date(milliseconds)
}

// Trend calculation utilities for NumberFlow
export function calculateTrend(oldValue: number, newValue: number): number {
  return Math.sign(newValue - oldValue)
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}

// Format options for different number types
export const numberFormatOptions = {
  count: { maximumFractionDigits: 0 },
  decimal: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  currency: { style: 'currency', currency: 'USD' } as const,
  percentage: { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 } as const,
  bytes: { maximumFractionDigits: 1 },
  time: { maximumFractionDigits: 0 }
} as const

// Animation timing presets
export const animationTimings = {
  fast: {
    transformTiming: { duration: 400, easing: 'ease-out' },
    spinTiming: { duration: 400 },
    opacityTiming: { duration: 200, easing: 'ease-out' }
  },
  normal: {
    transformTiming: { duration: 750, easing: 'ease-out' },
    spinTiming: { duration: 750 },
    opacityTiming: { duration: 350, easing: 'ease-out' }
  },
  slow: {
    transformTiming: { duration: 1200, easing: 'ease-out' },
    spinTiming: { duration: 1200 },
    opacityTiming: { duration: 600, easing: 'ease-out' }
  }
} as const