/**
 * Environment Variable Utilities
 * 
 * Helper functions for accessing and parsing Vite environment variables
 * with proper type conversion and validation.
 */

/**
 * Get a string environment variable with optional default
 */
export function getEnvString(key: keyof ImportMetaEnv, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Get a number environment variable with optional default
 */
export function getEnvNumber(key: keyof ImportMetaEnv, defaultValue?: number): number {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`);
  }
  
  return parsed;
}

/**
 * Get a boolean environment variable with optional default
 */
export function getEnvBoolean(key: keyof ImportMetaEnv, defaultValue?: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || lowerValue === '1') {
    return true;
  }
  if (lowerValue === 'false' || lowerValue === '0') {
    return false;
  }
  
  throw new Error(`Environment variable ${key} must be 'true' or 'false', got: ${value}`);
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Get the current mode
 */
export function getMode(): string {
  return import.meta.env.MODE;
}

/**
 * Validate that all required environment variables are set
 */
export function validateRequiredEnvVars(): void {
  const requiredVars: Array<keyof ImportMetaEnv> = [
    'VITE_API_BASE',
  ];
  
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    try {
      getEnvString(varName);
    } catch (error) {
      missing.push(String(varName));
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

/**
 * Get environment configuration object with all parsed values
 */
export function getEnvConfig() {
  return {
    // API Configuration
    apiBase: getEnvString('VITE_API_BASE', 'http://localhost:8080'),
    apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
    apiRetries: getEnvNumber('VITE_API_RETRIES', 3),
    
    // Real-time Configuration
    pollingInterval: getEnvNumber('VITE_POLLING_INTERVAL', 10000),
    backgroundRefresh: getEnvBoolean('VITE_BACKGROUND_REFRESH', true),
    
    // Development Configuration
    enableLogging: getEnvBoolean('VITE_ENABLE_LOGGING', isDevelopment()),
    enableDevTools: getEnvBoolean('VITE_ENABLE_DEV_TOOLS', isDevelopment()),
    
    // Feature Flags
    realTimeUpdates: getEnvBoolean('VITE_REAL_TIME_UPDATES', true),
    infiniteScrolling: getEnvBoolean('VITE_INFINITE_SCROLLING', true),
    keyboardNavigation: getEnvBoolean('VITE_KEYBOARD_NAVIGATION', true),
    offlineSupport: getEnvBoolean('VITE_OFFLINE_SUPPORT', false),
    advancedMetrics: getEnvBoolean('VITE_ADVANCED_METRICS', true),
    
    // Built-in Vite variables
    mode: getMode(),
    isDev: isDevelopment(),
    isProd: isProduction(),
    baseUrl: import.meta.env.BASE_URL,
  };
}

/**
 * Log environment configuration (development only)
 */
export function logEnvConfig(): void {
  if (!isDevelopment()) {
    return;
  }
  
  const config = getEnvConfig();
  console.group('🔧 Environment Configuration');
  console.table(config);
  console.groupEnd();
}

/**
 * Initialize environment validation and logging
 */
export function initializeEnv(): void {
  try {
    validateRequiredEnvVars();
    logEnvConfig();
  } catch (error) {
    console.error('❌ Environment Configuration Error:', error);
    throw error;
  }
}