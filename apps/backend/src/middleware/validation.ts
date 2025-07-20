import { Context, Next } from 'hono';

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
  errors?: ValidationError[];
  timestamp: number;
  request_id?: string;
}

class RequestLimits {
  maxRequestSize = 1024 * 1024; // 1MB
  maxResponseSize = 10 * 1024 * 1024; // 10MB
  timeout = 30000; // 30 seconds
  maxTickNumber = 1000000000n; // 1 billion
  maxRecentTicks = 1000;
}

export const limits = new RequestLimits();

export function validateTransactionHash(hash: string): ValidationError | null {
  if (!hash) {
    return {
      field: 'hash',
      message: 'Transaction hash is required',
      code: 'required'
    };
  }

  if (!/^[a-fA-F0-9]{8}$/.test(hash)) {
    return {
      field: 'hash',
      message: 'Transaction hash must be exactly 8 hexadecimal characters',
      code: 'invalid_format'
    };
  }

  return null;
}

export function validateTickNumber(tickStr: string): { value: bigint; error?: ValidationError } {
  if (!tickStr) {
    return {
      value: 0n,
      error: {
        field: 'number',
        message: 'Tick number is required',
        code: 'required'
      }
    };
  }

  let tickNum: bigint;
  try {
    tickNum = BigInt(tickStr);
  } catch {
    return {
      value: 0n,
      error: {
        field: 'number',
        message: 'Tick number must be a valid positive integer',
        code: 'invalid_format'
      }
    };
  }

  if (tickNum < 0n) {
    return {
      value: 0n,
      error: {
        field: 'number',
        message: 'Tick number must be positive',
        code: 'invalid_format'
      }
    };
  }

  if (tickNum > limits.maxTickNumber) {
    return {
      value: 0n,
      error: {
        field: 'number',
        message: `Tick number must not exceed ${limits.maxTickNumber}`,
        code: 'out_of_range'
      }
    };
  }

  return { value: tickNum };
}

export function validateQueryParams(c: Context): ValidationError[] {
  const errors: ValidationError[] = [];
  const url = new URL(c.req.url);

  // Validate limit parameter
  const limitStr = url.searchParams.get('limit');
  if (limitStr) {
    const limit = parseInt(limitStr, 10);
    if (isNaN(limit)) {
      errors.push({
        field: 'limit',
        message: 'Limit must be a valid integer',
        code: 'invalid_format'
      });
    } else if (limit < 1) {
      errors.push({
        field: 'limit',
        message: 'Limit must be greater than 0',
        code: 'out_of_range'
      });
    } else if (limit > limits.maxRecentTicks) {
      errors.push({
        field: 'limit',
        message: `Limit must not exceed ${limits.maxRecentTicks}`,
        code: 'out_of_range'
      });
    }
  }

  // Validate offset parameter
  const offsetStr = url.searchParams.get('offset');
  if (offsetStr) {
    let offset: bigint;
    try {
      offset = BigInt(offsetStr);
    } catch {
      errors.push({
        field: 'offset',
        message: 'Offset must be a valid non-negative integer',
        code: 'invalid_format'
      });
      return errors;
    }

    if (offset < 0n) {
      errors.push({
        field: 'offset',
        message: 'Offset must be non-negative',
        code: 'invalid_format'
      });
    } else if (offset > limits.maxTickNumber) {
      errors.push({
        field: 'offset',
        message: `Offset must not exceed ${limits.maxTickNumber}`,
        code: 'out_of_range'
      });
    }
  }

  return errors;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\x00/g, '');
}

export function sendErrorResponse(c: Context, statusCode: number, message: string, validationErrors?: ValidationError[]): Response {
  const response: ErrorResponse = {
    error: getStatusText(statusCode),
    message,
    errors: validationErrors,
    timestamp: Math.floor(Date.now() / 1000)
  };

  console.error(`❌ [${c.req.method} ${c.req.url}] ${statusCode}: ${message}`);
  if (validationErrors?.length) {
    console.error('   Validation errors:', validationErrors);
  }

  return c.json(response, statusCode);
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
  };
  return statusTexts[code] || 'Unknown Error';
}

export function requestSizeLimit() {
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('content-length');
    if (contentLength && parseInt(contentLength) > limits.maxRequestSize) {
      return sendErrorResponse(
        c,
        413,
        `Request body too large. Maximum size: ${limits.maxRequestSize} bytes`
      );
    }
    await next();
  };
}

export function panicRecovery() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      console.error('❌ Panic recovered:', error);
      return sendErrorResponse(c, 500, 'Internal server error');
    }
  };
}

export function simpleLogging() {
  return async (c: Context, next: Next) => {
    if (process.env.DEBUG === 'true') {
      console.log(`📡 ${c.req.method} ${c.req.url}`);
    }
    await next();
  };
}