/**
 * Frontend environment configuration using shared config
 */

import { createFrontendConfig } from '@fermi/config/frontend'

// Convert import.meta.env to plain object for the shared config function
const envVars = {
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  VITE_ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING,
  VITE_ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS,
  DEV: import.meta.env.DEV ? 'true' : 'false',
  PROD: import.meta.env.PROD ? 'true' : 'false',
}

// Create configuration using shared utilities
export const config = createFrontendConfig(envVars)

// Legacy exports for backward compatibility
export const API_BASE_URL = config.api.baseUrl
export const WS_URL = config.websocket.url
