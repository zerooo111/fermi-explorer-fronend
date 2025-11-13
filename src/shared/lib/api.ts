import { API_BASE_URL } from '@/shared/config/env';

/**
 * Creates a full API URL by combining a base URL with a route path
 * @param route - The route path (e.g., '/status' or '/api/v1/continuum/status')
 * @param baseUrl - Optional base URL (defaults to API_BASE_URL)
 * @returns The complete API URL
 */
export function makeApiUrl(route: string, baseUrl: string = API_BASE_URL): string {
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBase}${cleanRoute}`;
}

export function getApiUrl(path: string): string {
  return makeApiUrl(path);
}

export function getWsUrl(path: string): string {
  // For WebSocket, we need to use the appropriate protocol
  if (import.meta.env.DEV) {
    // In development, Vite proxy handles WebSocket upgrade
    return path;
  }
  
  // In production, use wss:// for secure WebSocket
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${protocol}//${host}${cleanPath}`;
}