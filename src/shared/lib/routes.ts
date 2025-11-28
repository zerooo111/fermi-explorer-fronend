// Centralized API route definitions for both Continuum and Rollup explorers
// Both use the same API_BASE_URL

import { makeApiUrl } from './api';

/**
 * Continuum API Routes
 */
export const continuumRoutes = {
  HEALTH: makeApiUrl('/health'),
  STATUS: makeApiUrl('/api/v1/continuum/status'),
  TICK: (tickNumber: number) => makeApiUrl(`/api/v1/continuum/tick/${tickNumber}`),
  TICKS: (params?: { limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit !== undefined) search.set('limit', String(params.limit));
    const qs = search.toString();
    return makeApiUrl(`/api/v1/continuum/ticks${qs ? `?${qs}` : ''}`);
  },
  RECENT_TICKS: (limit: number) => makeApiUrl(`/api/v1/continuum/tick/recent?limit=${limit}`),
  TX: (hash: string) => makeApiUrl(`/api/v1/continuum/tx/${hash}`),
  RECENT_TX: (limit: number) => makeApiUrl(`/api/v1/continuum/tx/recent?limit=${limit}`),
  STREAM_TICKS: (params?: { start_tick?: number }) => {
    const search = new URLSearchParams();
    if (params?.start_tick !== undefined) search.set('start_tick', String(params.start_tick));
    const qs = search.toString();
    return makeApiUrl(`/api/v1/continuum/stream-ticks${qs ? `?${qs}` : ''}`);
  },
  // New Continuum API endpoints
  TXN: (txnId: string) => makeApiUrl(`/api/v1/continuum/txn/${txnId}`),
  RECENT_TXN: (limit: number = 50) => makeApiUrl(`/api/v1/continuum/txn/recent?limit=${limit}`),
} as const;

/**
 * Rollup API Routes
 */
export const rollupRoutes = {
  STATUS: makeApiUrl('/api/v1/rollup/status'),
  MARKETS: makeApiUrl('/api/v1/rollup/markets'),
  LATEST_BLOCK: makeApiUrl('/api/v1/rollup/blocks/latest'),
  BLOCK: (height: number) => makeApiUrl(`/api/v1/rollup/blocks/${height}`),
  BLOCKS: (limit = 20, offset = 0) => {
    return makeApiUrl(`/api/v1/rollup/blocks?limit=${limit}&offset=${offset}`);
  },
  TRANSACTION: (id: string) => makeApiUrl(`/api/v1/rollup/transactions/${id}`),
  EVENTS: (marketId?: string, limit = 20, offset = 0) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (marketId) {
      params.append('market_id', marketId);
    }
    return makeApiUrl(`/api/v1/rollup/events?${params.toString()}`);
  },
} as const;

export type ContinuumRouteValue = typeof continuumRoutes[keyof typeof continuumRoutes];
export type RollupRouteValue = typeof rollupRoutes[keyof typeof rollupRoutes];

