/**
 * API Client Configuration
 *
 * Provides axios instance with interceptors for consistent API communication.
 */

import axios, { AxiosError } from 'axios'
import type { AxiosInstance } from 'axios'

/**
 * Create and configure axios instance
 */
export function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Apply interceptors
  applyInterceptors(client)

  return client
}

/**
 * Apply request/response interceptors to client
 */
function applyInterceptors(client: AxiosInstance): void {
  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add any auth tokens or headers here in the future
      return config
    },
    (error) => {
      console.error('Request error:', error)
      return Promise.reject(error)
    },
  )

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle rate limiting (429)
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after']
        console.warn(`Rate limited. Retry after: ${retryAfter}`)
      }

      // Handle auth errors (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Authentication required or permission denied')
        // Could trigger re-auth flow here
      }

      // Handle server errors
      if (error.response?.status && error.response.status >= 500) {
        console.error('Server error:', error.response.status, error.response.data)
      }

      return Promise.reject(error)
    },
  )
}

/**
 * Singleton API client instance
 */
let apiClient: AxiosInstance | null = null

/**
 * Get or create the API client singleton
 */
export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    apiClient = createApiClient(baseURL)
  }
  return apiClient
}

/**
 * Reset the API client (useful for testing)
 */
export function resetApiClient(): void {
  apiClient = null
}

export default getApiClient()
