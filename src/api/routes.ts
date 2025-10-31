// Centralized API endpoint definitions (fully qualified with base URL)
import { API_BASE_URL } from '@/config/env'

export const API_ROUTES = {
  HEALTH: `${API_BASE_URL}/health`,
  STATUS: `${API_BASE_URL}/api/v1/continuum/status`,
  TICK: (tickNumber: number) => `${API_BASE_URL}/api/v1/continuum/tick/${tickNumber}`,
  TICKS: (params?: { limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit !== undefined) search.set('limit', String(params.limit));
    const qs = search.toString();
    return `${API_BASE_URL}/api/v1/continuum/ticks${qs ? `?${qs}` : ''}`;
  },
  RECENT_TICKS: (limit: number) => `${API_BASE_URL}/api/v1/continuum/ticks/recent?limit=${limit}`,
  TX: (hash: string) => `${API_BASE_URL}/api/v1/continuum/tx/${hash}`,
  RECENT_TX: (limit: number) => `${API_BASE_URL}/api/v1/continuum/tx/recent?limit=${limit}`,
  STREAM_TICKS: (params?: { start_tick?: number }) => {
    const search = new URLSearchParams();
    if (params?.start_tick !== undefined) search.set('start_tick', String(params.start_tick));
    const qs = search.toString();
    return `${API_BASE_URL}/api/v1/continuum/stream-ticks${qs ? `?${qs}` : ''}`;
  },
} as const;

export type ApiRouteValue = typeof API_ROUTES[keyof typeof API_ROUTES];


