/// <reference types="vite/client" />

/**
 * TypeScript definitions for Vite environment variables
 * This ensures type safety and IntelliSense for custom environment variables
 */
interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_RETRIES: string
  
  // Real-time Updates
  readonly VITE_POLLING_INTERVAL: string
  readonly VITE_BACKGROUND_REFRESH: string
  
  // Development Configuration  
  readonly VITE_ENABLE_LOGGING: string
  readonly VITE_ENABLE_DEV_TOOLS: string
  
  // Feature Flags
  readonly VITE_REAL_TIME_UPDATES: string
  readonly VITE_INFINITE_SCROLLING: string
  readonly VITE_KEYBOARD_NAVIGATION: string
  readonly VITE_OFFLINE_SUPPORT: string
  readonly VITE_ADVANCED_METRICS: string
  
  // Built-in Vite variables
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}