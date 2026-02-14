/**
 * Market Entity Domain Model
 *
 * Domain model for markets in the Rollup layer.
 */

/**
 * Market type/kind
 */
export type MarketKind = 'spot' | 'perpetual'

/**
 * Market status
 */
export type MarketStatus = 'active' | 'inactive' | 'paused' | 'delisted'

/**
 * Perpetual market configuration
 */
export interface PerpConfig {
  initial_margin_rate: number
  maintenance_margin_rate: number
  max_leverage: number
  funding_rate?: number
  funding_interval?: number
  twap_price?: number
}

/**
 * Core Market entity
 */
export interface Market {
  id: string
  kind: MarketKind
  status: MarketStatus
  base_mint: string
  quote_mint: string
  base_decimals: number
  quote_decimals: number
  base_symbol: string
  quote_symbol: string
  created_at: number
  updated_at?: number
  // Market-specific fields
  perp_config?: PerpConfig
}

/**
 * Market statistics
 */
export interface MarketStats {
  total_orders: number
  total_volume: number
  total_cancels: number
  average_order_size: number
  order_count_24h?: number
  volume_24h?: number
}

/**
 * Market with statistics
 */
export interface MarketWithStats extends Market {
  stats: MarketStats
}

/**
 * Market summary for listings
 */
export interface MarketSummary {
  id: string
  kind: MarketKind
  base_symbol: string
  quote_symbol: string
  status: MarketStatus
  order_count: number
  volume_24h?: number
}

/**
 * Spot market (specific implementation)
 */
export interface SpotMarket extends Market {
  kind: 'spot'
  perp_config?: never
}

/**
 * Perpetual market (specific implementation)
 */
export interface PerpMarket extends Market {
  kind: 'perpetual'
  perp_config: PerpConfig
}

/**
 * Market pair information
 */
export interface MarketPair {
  base: {
    mint: string
    symbol: string
    decimals: number
  }
  quote: {
    mint: string
    symbol: string
    decimals: number
  }
}

/**
 * Type guards
 */
export function isMarket(value: unknown): value is Market {
  if (!value || typeof value !== 'object') return false
  const obj = value as unknown as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    (obj.kind === 'spot' || obj.kind === 'perpetual') &&
    typeof obj.base_mint === 'string' &&
    typeof obj.quote_mint === 'string'
  )
}

export function isSpotMarket(value: unknown): value is SpotMarket {
  return isMarket(value) && (value as Market).kind === 'spot'
}

export function isPerpMarket(value: unknown): value is PerpMarket {
  return isMarket(value) && (value as Market).kind === 'perpetual' && !!(value as Market).perp_config
}

export function isMarketWithStats(value: unknown): value is MarketWithStats {
  return isMarket(value) && typeof (value as unknown as Record<string, unknown>).stats === 'object'
}
