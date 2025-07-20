/**
 * Backend configuration for Fermi Explorer
 */

export interface BackendConfig {
  httpPort: string
  grpcAddr: string
  restAddr: string
  debug: boolean
  corsAllowedOrigins: string[]
  corsAllowCredentials: boolean
  environment: string
}

export function loadBackendConfig(): BackendConfig {
  // Check for single IP configuration first
  const continuumIP = process.env.CONTINUUM_IP
  let grpcAddr = process.env.CONTINUUM_SEQUENCER_URL || 'localhost:9090'
  let restAddr = process.env.CONTINUUM_REST_URL || 'http://localhost:8080/api/v1'

  if (continuumIP) {
    grpcAddr = `${continuumIP}:9090`
    restAddr = `http://${continuumIP}:8080/api/v1`
    console.log(`🌐 Using CONTINUUM_IP: ${continuumIP}`)
    console.log(`📡 Constructed gRPC address: ${grpcAddr}`)
    console.log(`🔗 Constructed REST URL: ${restAddr}`)
  } else {
    if (process.env.CONTINUUM_SEQUENCER_URL) {
      console.log(`📡 Using sequencer from env: ${grpcAddr}`)
    }
    if (process.env.CONTINUUM_REST_URL) {
      console.log(`🔗 Using REST URL from env: ${restAddr}`)
    }
  }

  // HTTP port configuration
  const httpPort = process.env.HTTP_PORT || '3001'
  if (process.env.HTTP_PORT) {
    console.log(`🌐 Using HTTP port from env: ${httpPort}`)
  }

  // Debug mode
  const debug = process.env.DEBUG === 'true'
  if (debug) {
    console.log('🐛 Debug mode enabled')
  }

  // CORS configuration
  const corsOriginsEnv = process.env.CORS_ALLOWED_ORIGINS
  let corsAllowedOrigins: string[]
  
  if (corsOriginsEnv) {
    corsAllowedOrigins = corsOriginsEnv.split(',').map(origin => origin.trim())
  } else {
    corsAllowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001'
    ]
    console.log('⚠️  Using default CORS origins. Set CORS_ALLOWED_ORIGINS for production.')
  }

  // CORS credentials
  const corsAllowCredentials = process.env.CORS_ALLOW_CREDENTIALS === 'true'
  const environment = process.env.GO_ENV || process.env.NODE_ENV || 'development'
  
  if (environment === 'production' && corsAllowCredentials) {
    console.log('⚠️  CORS credentials enabled in production. Ensure this is intended.')
  }

  return {
    httpPort,
    grpcAddr,
    restAddr,
    debug,
    corsAllowedOrigins,
    corsAllowCredentials,
    environment
  }
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback?: string): string {
  return process.env[key] ?? fallback ?? ''
}

/**
 * Get boolean environment variable
 */
export function getBoolEnv(key: string, fallback = false): boolean {
  const value = process.env[key]
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true'
}

/**
 * Get number environment variable
 */
export function getNumberEnv(key: string, fallback = 0): number {
  const value = process.env[key]
  if (value === undefined) return fallback
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}