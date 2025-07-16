/**
 * Continuum Sequencer API Client
 *
 * Centralized HTTP client with error handling, retry logic, and TypeScript support.
 * Designed for use with TanStack Query for optimal caching and performance.
 */

import { getApiConfig } from '../config/env'

/**
 * API configuration interface
 */
export interface ApiConfig {
  baseUrl: string
  timeout: number
  retries: number
}

/**
 * Default API configuration from environment
 */
const DEFAULT_CONFIG: ApiConfig = getApiConfig()

/**
 * Custom error class for API-specific errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public endpoint: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Network connectivity error
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public endpoint: string,
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * HTTP client class with built-in error handling and retry logic
 */
class ApiClient {
  private config: ApiConfig

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Get the full URL for an API endpoint
   */
  private getUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    console.log({ cleanPath, path })
    return `${this.config.baseUrl}${cleanPath}`
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof ApiError) {
      // Retry on server errors and rate limiting
      return error.status >= 500 || error.status === 429
    }

    if (error instanceof NetworkError) {
      return true
    }

    // Retry on network failures
    return error instanceof TypeError && error.message.includes('fetch')
  }

  /**
   * Calculate exponential backoff delay
   */
  private getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000) // Cap at 10 seconds
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = this.getUrl(path)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    let lastError: unknown

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions)
        clearTimeout(timeoutId)

        // Handle different response statuses
        if (response.ok) {
          // Special handling for 204 No Content
          if (response.status === 204) {
            return {} as T
          }

          const data = await response.json()
          return data as T
        }

        // Handle specific error responses
        if (response.status === 404) {
          // For 404s, return a "not found" response rather than throwing
          return { found: false } as T
        }

        // Try to parse error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // Ignore JSON parse errors for error responses
        }

        const apiError = new ApiError(
          errorMessage,
          response.status,
          response.statusText,
          path,
        )

        // Don't retry client errors (except rate limiting)
        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          throw apiError
        }

        lastError = apiError
      } catch (error) {
        clearTimeout(timeoutId)

        // Handle abort/timeout errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = new NetworkError(
            `Request timeout after ${this.config.timeout}ms`,
            path,
          )
        } else if (error instanceof TypeError) {
          lastError = new NetworkError(`Network error: ${error.message}`, path)
        } else {
          lastError = error
        }
      }

      // Don't retry on the last attempt
      if (attempt < this.config.retries && this.isRetryableError(lastError)) {
        const delay = this.getRetryDelay(attempt)
        await this.sleep(delay)
        continue
      }

      break
    }

    throw lastError
  }

  /**
   * GET request
   */
  async get<T>(path: string): Promise<T> {
    return this.makeRequest<T>(path, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.makeRequest<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(path: string, data?: unknown): Promise<T> {
    return this.makeRequest<T>(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    return this.makeRequest<T>(path, { method: 'DELETE' })
  }

  /**
   * Update API configuration
   */
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config }
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient()

/**
 * Create a new API client with custom configuration
 */
export const createApiClient = (config: Partial<ApiConfig> = {}): ApiClient => {
  return new ApiClient(config)
}

/**
 * Utility function to check if an error is an API error
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}

/**
 * Utility function to check if an error is a network error
 */
export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError
}

/**
 * Export the ApiClient class for advanced usage
 */
export { ApiClient }
