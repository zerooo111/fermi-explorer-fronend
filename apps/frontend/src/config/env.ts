/**
 * Simple environment configuration for MVP
 */

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE || 'http://localhost:3001'

// WebSocket Configuration
export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') +
    '/ws/ticks'

// Simple config object
export const config = {
  api: {
    baseUrl: API_BASE_URL,
  },
  websocket: {
    url: WS_URL,
  },
}
