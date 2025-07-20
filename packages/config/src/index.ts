/**
 * Shared configuration for Fermi Explorer monorepo
 * 
 * This package provides environment configuration utilities
 * for both frontend and backend applications.
 */

// Backend configuration
export * from './backend'

// Frontend configuration
export * from './frontend'

// Common configuration constants
export const DEFAULT_PORTS = {
  BACKEND: 3001,
  FRONTEND: 3000,
  SEQUENCER_GRPC: 9090,
  SEQUENCER_REST: 8080,
} as const

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const

export const API_VERSIONS = {
  V1: 'v1',
} as const

export const ENDPOINTS = {
  HEALTH: '/api/v1/health',
  STATUS: '/api/v1/status',
  TRANSACTION: '/api/v1/tx',
  TICK: '/api/v1/tick',
  RECENT_TICKS: '/api/v1/ticks/recent',
  WEBSOCKET_TICKS: '/ws/ticks',
} as const