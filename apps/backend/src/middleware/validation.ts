import { Context, Next } from 'hono'
import type { ValidationError, ErrorResponse } from '@fermi/shared-types/validation'
import { 
  validateTransactionHash, 
  validateTickNumber, 
  validatePaginationParams, 
  sanitizeInput as sanitizeInputUtil,
  DEFAULT_LIMITS 
} from '@fermi/shared-utils/validation'
import { HTTP_STATUS } from '@fermi/shared-utils/constants'

export const limits = DEFAULT_LIMITS

// Re-export validation functions for backward compatibility
export { validateTransactionHash, validateTickNumber } from '@fermi/shared-utils/validation'

// Create wrapper functions to avoid conflicts
export function sanitizeInput(input: string): string {
  return sanitizeInputUtil(input)
}

export function validateQueryParams(c: Context): ValidationError[] {
  const url = new URL(c.req.url)
  const limitStr = url.searchParams.get('limit')
  const offsetStr = url.searchParams.get('offset')
  
  return validatePaginationParams(limitStr || undefined, offsetStr || undefined, limits)
}

export function sendErrorResponse(c: Context, statusCode: number, message: string, validationErrors?: ValidationError[]): Response {
  const response: ErrorResponse = {
    error: getStatusText(statusCode),
    message,
    errors: validationErrors,
    timestamp: Math.floor(Date.now() / 1000)
  }

  console.error(`❌ [${c.req.method} ${c.req.url}] ${statusCode}: ${message}`)
  if (validationErrors?.length) {
    console.error('   Validation errors:', validationErrors)
  }

  return c.json(response, statusCode as any)
}

function getStatusText(code: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    413: 'Request Entity Too Large',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  }
  return statusTexts[code] || 'Unknown Error'
}

export function requestSizeLimit() {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('content-length')
    if (contentLength && parseInt(contentLength) > limits.maxRequestSize) {
      return sendErrorResponse(
        c,
        413,
        `Request body too large. Maximum size: ${limits.maxRequestSize} bytes`
      )
    }
    await next()
  }
}

export function panicRecovery() {
  return async (c: Context, next: Next) => {
    try {
      await next()
    } catch (error) {
      console.error('❌ Panic recovered:', error)
      return sendErrorResponse(c, 500, 'Internal server error')
    }
  }
}

export function simpleLogging() {
  return async (c: Context, next: Next) => {
    if (process.env.DEBUG === 'true') {
      console.log(`📡 ${c.req.method} ${c.req.url}`)
    }
    await next()
  }
}