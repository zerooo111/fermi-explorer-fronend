/**
 * Metrics middleware for automatic HTTP request tracking
 */

import { Context, Next } from 'hono'
import { MetricsCollector } from '../metrics/metrics'

/**
 * Middleware to automatically collect HTTP request metrics
 */
export function metricsMiddleware() {
  return async (c: Context, next: Next) => {
    const start = Date.now()
    const method = c.req.method
    const url = new URL(c.req.url)
    const route = url.pathname

    try {
      await next()
    } finally {
      const duration = (Date.now() - start) / 1000 // Convert to seconds
      const statusCode = c.res.status || 200

      // Record metrics
      MetricsCollector.recordHttpRequest(method, route, statusCode, duration)

      // Log request if debug mode
      if (process.env.DEBUG === 'true') {
        console.log(`📊 ${method} ${route} ${statusCode} ${duration.toFixed(3)}s`)
      }
    }
  }
}

/**
 * Middleware for metrics endpoint to exclude it from general metrics
 */
export function metricsExclusionMiddleware() {
  return async (c: Context, next: Next) => {
    const url = new URL(c.req.url)
    if (url.pathname === '/metrics') {
      // Skip metrics collection for the metrics endpoint itself
      await next()
      return
    }
    await next()
  }
}