/**
 * Environment configuration for Fermi Explorer
 * Centralizes all environment variable handling with type safety and defaults
 */

// Helper function to get environment variables with defaults
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue
}

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key]
  return value ? parseInt(value, 10) : defaultValue
}


// ===========================================
// API Configuration
// ===========================================

export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001')
export const WS_URL = getEnvVar('VITE_WS_URL', 'ws://localhost:3001/ws')

// ===========================================
// Application Configuration
// ===========================================

export const REQUEST_TIMEOUT = getEnvNumber('VITE_REQUEST_TIMEOUT', 10000)
export const WS_MAX_RECONNECT_ATTEMPTS = getEnvNumber('VITE_WS_MAX_RECONNECT_ATTEMPTS', 5)
export const WS_RECONNECT_DELAY = getEnvNumber('VITE_WS_RECONNECT_DELAY', 3000)

// React Query Configuration
export const DEFAULT_CACHE_TIME = getEnvNumber('VITE_DEFAULT_CACHE_TIME', 5 * 60 * 1000) // 5 minutes
export const DEFAULT_STALE_TIME = getEnvNumber('VITE_DEFAULT_STALE_TIME', 60 * 1000) // 1 minute

// ===========================================
// Development Configuration
// ===========================================

export const IS_DEVELOPMENT = import.meta.env.DEV
export const IS_PRODUCTION = import.meta.env.PROD

// ===========================================
// Validation
// ===========================================

// Validate required environment variables
const requiredEnvVars = {
  VITE_API_BASE_URL: API_BASE_URL,
  VITE_WS_URL: WS_URL,
}

// Check for missing required variables in development
if (IS_DEVELOPMENT) {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}\n` +
      'Using default values. Consider creating a .env.local file.'
    )
  }
}

// ===========================================
// Export configuration object for convenience
// ===========================================

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    wsUrl: WS_URL,
    timeout: REQUEST_TIMEOUT,
  },
  websocket: {
    maxReconnectAttempts: WS_MAX_RECONNECT_ATTEMPTS,
    reconnectDelay: WS_RECONNECT_DELAY,
  },
  query: {
    defaultCacheTime: DEFAULT_CACHE_TIME,
    defaultStaleTime: DEFAULT_STALE_TIME,
  },
  app: {
    isDevelopment: IS_DEVELOPMENT,
    isProduction: IS_PRODUCTION,
  },
} as const

export default config
