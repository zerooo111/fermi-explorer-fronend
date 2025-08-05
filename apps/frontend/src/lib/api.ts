export function getApiUrl(path: string): string {
  // Always use relative URLs - Nginx will proxy them in production
  return path.startsWith('/') ? path : `/${path}`;
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