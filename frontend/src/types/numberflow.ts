// TypeScript definitions for NumberFlow integration

export interface NumberFlowTimingConfig {
  duration: number
  easing?: string
}

export interface NumberFlowTimings {
  transformTiming: NumberFlowTimingConfig
  spinTiming: NumberFlowTimingConfig
  opacityTiming: NumberFlowTimingConfig
}

export interface NumberFlowProps {
  value: number | undefined
  format?: Intl.NumberFormatOptions
  locales?: string | Array<string>
  prefix?: string
  suffix?: string
  trend?: (oldValue: number, newValue: number) => number
  animated?: boolean
  respectMotionPreference?: boolean
  className?: string
  fallback?: string
}

export type NumberType =
  | 'count'
  | 'decimal'
  | 'currency'
  | 'percentage'
  | 'bytes'
  | 'time'

// Preset configurations for different number types
export interface NumberFormatPresets {
  count: Intl.NumberFormatOptions
  decimal: Intl.NumberFormatOptions
  currency: Intl.NumberFormatOptions
  percentage: Intl.NumberFormatOptions
  bytes: Intl.NumberFormatOptions
  time: Intl.NumberFormatOptions
}

// Animation timing presets
export type AnimationSpeed = 'fast' | 'normal' | 'slow'

export interface AnimationTimingPresets {
  fast: NumberFlowTimings
  normal: NumberFlowTimings
  slow: NumberFlowTimings
}

// Trend calculation types
export type TrendDirection = -1 | 0 | 1
export type TrendCalculator = (
  oldValue: number,
  newValue: number,
) => TrendDirection

// Byte formatting result
export interface ByteFormatResult {
  value: number
  suffix: string
}

// Common metrics types for the application
export interface MetricsData {
  chainHeight?: number
  totalTransactions?: number
  latestTick?: number
  tps?: number
  tickRate?: number
  avgTxPerTick?: number
}

export interface TickData {
  tick_number: number
  timestamp: number
  transaction_count: number
  vdf_iterations: number
  transaction_batch_hash: string
  previous_output: string
}

export interface TransactionData {
  tick_number: number
  sequence_number: number
  ingestion_timestamp: number
  payload_size: number
}

// Enhanced data properties for computed values
export interface EnhancedDataProperties {
  ageInSeconds?: number
  formattedTimestamp?: string
  relativeTime?: string
  sizeFormatted?: string
  isRecent?: boolean
  averageTransactionSize?: number
}

// Component-specific props
export interface ChainStatusProps {
  className?: string
  showPerformanceMetrics?: boolean
  enableRealTime?: boolean
  compact?: boolean
}

export interface LiveTicksProps {
  limit?: number
  showTransactions?: boolean
  className?: string
}

export interface RecentTicksProps {
  limit?: number
  showAge?: boolean
}
