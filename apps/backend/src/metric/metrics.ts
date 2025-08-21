/**
 * Prometheus metrics collection for Fermi Explorer Backend
 */

import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client'

// Collect default Node.js metrics
collectDefaultMetrics()

// HTTP Request Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

// gRPC Client Metrics
export const grpcRequestDuration = new Histogram({
  name: 'grpc_request_duration_seconds',
  help: 'Duration of gRPC requests in seconds',
  labelNames: ['method', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})

export const grpcRequestTotal = new Counter({
  name: 'grpc_requests_total',
  help: 'Total number of gRPC requests',
  labelNames: ['method', 'status']
})

export const grpcConnectionStatus = new Gauge({
  name: 'grpc_connection_status',
  help: 'Status of gRPC connection (1 = connected, 0 = disconnected)'
})

// WebSocket Metrics
export const websocketConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
})

export const websocketMessagesTotal = new Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages sent',
  labelNames: ['type']
})

export const websocketConnectionDuration = new Histogram({
  name: 'websocket_connection_duration_seconds',
  help: 'Duration of WebSocket connections in seconds',
  buckets: [1, 5, 10, 30, 60, 300, 600, 1800, 3600]
})

// Application-specific Metrics
export const ticksProcessed = new Counter({
  name: 'ticks_processed_total',
  help: 'Total number of ticks processed'
})

export const transactionsProcessed = new Counter({
  name: 'transactions_processed_total',
  help: 'Total number of transactions processed'
})

export const validationErrors = new Counter({
  name: 'validation_errors_total',
  help: 'Total number of validation errors',
  labelNames: ['type', 'field']
})

export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type']
})

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type']
})

// System Health Metrics
export const lastSuccessfulHealthCheck = new Gauge({
  name: 'last_successful_health_check_timestamp',
  help: 'Timestamp of last successful health check'
})

export const sequencerConnectionStatus = new Gauge({
  name: 'sequencer_connection_status',
  help: 'Status of connection to Continuum Sequencer (1 = connected, 0 = disconnected)'
})

export const currentTickNumber = new Gauge({
  name: 'current_tick_number',
  help: 'Current tick number from sequencer'
})

export const pendingTransactions = new Gauge({
  name: 'pending_transactions',
  help: 'Number of pending transactions in sequencer'
})

// Memory and Performance Metrics
export const memoryUsage = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
})

export const responseTime = new Histogram({
  name: 'response_time_seconds',
  help: 'Response time for various operations',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
})

// Error Metrics
export const errors = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity']
})

// Business Logic Metrics
export const apiCallsTotal = new Counter({
  name: 'api_calls_total',
  help: 'Total number of API calls made to external services',
  labelNames: ['service', 'endpoint', 'status']
})

export const dataFreshness = new Gauge({
  name: 'data_freshness_seconds',
  help: 'Age of data in seconds',
  labelNames: ['data_type']
})

/**
 * Metrics collection utilities
 */
export class MetricsCollector {
  /**
   * Record HTTP request metrics
   */
  static recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    const labels = { method, route, status_code: statusCode.toString() }
    httpRequestDuration.observe(labels, duration)
    httpRequestTotal.inc(labels)
  }

  /**
   * Record gRPC request metrics
   */
  static recordGrpcRequest(method: string, status: string, duration: number) {
    const labels = { method, status }
    grpcRequestDuration.observe(labels, duration)
    grpcRequestTotal.inc(labels)
  }

  /**
   * Update WebSocket connection count
   */
  static updateWebSocketConnections(count: number) {
    websocketConnections.set(count)
  }

  /**
   * Record WebSocket message
   */
  static recordWebSocketMessage(type: string) {
    websocketMessagesTotal.inc({ type })
  }

  /**
   * Record validation error
   */
  static recordValidationError(type: string, field: string) {
    validationErrors.inc({ type, field })
  }

  /**
   * Record application error
   */
  static recordError(type: string, severity: string) {
    errors.inc({ type, severity })
  }

  /**
   * Update sequencer status
   */
  static updateSequencerStatus(connected: boolean, tickNumber?: number, pendingTxs?: number) {
    sequencerConnectionStatus.set(connected ? 1 : 0)
    if (tickNumber !== undefined) {
      currentTickNumber.set(tickNumber)
    }
    if (pendingTxs !== undefined) {
      pendingTransactions.set(pendingTxs)
    }
  }

  /**
   * Update memory usage metrics
   */
  static updateMemoryUsage() {
    const usage = process.memoryUsage()
    memoryUsage.set({ type: 'rss' }, usage.rss)
    memoryUsage.set({ type: 'heapUsed' }, usage.heapUsed)
    memoryUsage.set({ type: 'heapTotal' }, usage.heapTotal)
    memoryUsage.set({ type: 'external' }, usage.external)
  }

  /**
   * Record data freshness
   */
  static recordDataFreshness(dataType: string, ageInSeconds: number) {
    dataFreshness.set({ data_type: dataType }, ageInSeconds)
  }

  /**
   * Record API call to external service
   */
  static recordApiCall(service: string, endpoint: string, status: string) {
    apiCallsTotal.inc({ service, endpoint, status })
  }
}

/**
 * Get all metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return register.metrics()
}

/**
 * Get metrics registry for advanced usage
 */
export function getRegistry() {
  return register
}

/**
 * Initialize metrics collection
 */
export function initializeMetrics() {
  console.log('📊 Prometheus metrics initialized')
  
  // Set up periodic memory usage collection
  setInterval(() => {
    MetricsCollector.updateMemoryUsage()
  }, 10000) // Every 10 seconds

  // Set initial values
  grpcConnectionStatus.set(0)
  sequencerConnectionStatus.set(0)
  websocketConnections.set(0)
}