/**
 * Get environment variable with fallback
 */
export function getEnvVar(
  env: Record<string, string | undefined>,
  key: string,
  fallback?: string
): string {
  return env[key] ?? fallback ?? "";
}

/**
 * Get boolean environment variable
 */
export function getBoolEnvVar(
  env: Record<string, string | undefined>,
  key: string,
  fallback = false
): boolean {
  const value = env[key];
  if (value === undefined) return fallback;
  return value === "true";
}

/**
 * Check if running in development mode
 */
export function isDevelopment(
  env: Record<string, string | undefined>
): boolean {
  return env.DEV === "true" || env.NODE_ENV === "development";
}

/**
 * Check if running in production mode
 */
export function isProduction(env: Record<string, string | undefined>): boolean {
  return env.PROD === "true" || env.NODE_ENV === "production";
}
