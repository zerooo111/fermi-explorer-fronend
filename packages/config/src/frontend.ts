/**
 * Frontend configuration for Fermi Explorer
 * Note: This package provides runtime config functions - actual env access happens in the frontend app
 */

export interface FrontendConfig {
  api: {
    baseUrl: string
  }
  websocket: {
    url: string
  }
  features: {
    enableLogging: boolean
    enableDevTools: boolean
  }
}

/**
 * Create frontend configuration from provided values
 * This allows the frontend app to pass in the actual env values
 */
export function createFrontendConfig(env: Record<string, string | undefined>): FrontendConfig {
  // API Configuration
  const apiBaseUrl = env.VITE_API_BASE || 'http://localhost:3001'

  // WebSocket Configuration
  const wsUrl = env.VITE_WS_URL ||
    apiBaseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/ticks'

  // Feature flags
  const enableLogging = env.VITE_ENABLE_LOGGING === 'true'
  const enableDevTools = env.VITE_ENABLE_DEV_TOOLS === 'true' || env.DEV === 'true'

  return {
    api: {
      baseUrl: apiBaseUrl,
    },
    websocket: {
      url: wsUrl,
    },
    features: {
      enableLogging,
      enableDevTools,
    }
  }
}

/**
 * Default frontend configuration
 */
export function getDefaultFrontendConfig(): FrontendConfig {
  return createFrontendConfig({})
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(env: Record<string, string | undefined>, key: string, fallback?: string): string {
  return env[key] ?? fallback ?? ''
}

/**
 * Get boolean environment variable
 */
export function getBoolEnvVar(env: Record<string, string | undefined>, key: string, fallback = false): boolean {
  const value = env[key]
  if (value === undefined) return fallback
  return value === 'true'
}

/**
 * Check if running in development mode
 */
export function isDevelopment(env: Record<string, string | undefined>): boolean {
  return env.DEV === 'true' || env.NODE_ENV === 'development'
}

/**
 * Check if running in production mode
 */
export function isProduction(env: Record<string, string | undefined>): boolean {
  return env.PROD === 'true' || env.NODE_ENV === 'production'
}