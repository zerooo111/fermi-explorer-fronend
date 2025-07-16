/**
 * Environment Configuration for Continuum Sequencer Frontend
 * 
 * Centralized configuration management with type safety, validation,
 * and development/production environment handling.
 */

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  /**
   * API configuration
   */
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  
  /**
   * Cache configuration
   */
  cache: {
    defaultStaleTime: number;
    defaultCacheTime: number;
    maxMemoryUsage: number; // in MB
  };
  
  /**
   * Real-time updates configuration
   */
  realTime: {
    defaultPollingInterval: number;
    fastPollingInterval: number;
    backgroundRefreshEnabled: boolean;
  };
  
  /**
   * UI configuration
   */
  ui: {
    defaultPageSize: number;
    maxPageSize: number;
    animationsEnabled: boolean;
    autoRefreshEnabled: boolean;
  };
  
  /**
   * Development configuration
   */
  development: {
    enableLogging: boolean;
    enableDevTools: boolean;
    mockApiDelay: number;
  };
  
  /**
   * Feature flags
   */
  features: {
    realTimeUpdates: boolean;
    infiniteScrolling: boolean;
    keyboardNavigation: boolean;
    offlineSupport: boolean;
    advancedMetrics: boolean;
  };
  
  /**
   * Performance configuration
   */
  performance: {
    prefetchRange: number;
    imageOptimization: boolean;
    lazyLoading: boolean;
    bundleAnalysis: boolean;
  };
}

/**
 * Development environment configuration
 */
const developmentConfig: EnvironmentConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
    timeout: 30000,
    retries: 3,
  },
  cache: {
    defaultStaleTime: 10 * 1000, // 10 seconds
    defaultCacheTime: 5 * 60 * 1000, // 5 minutes
    maxMemoryUsage: 50, // 50MB
  },
  realTime: {
    defaultPollingInterval: 10 * 1000, // 10 seconds
    fastPollingInterval: 5 * 1000, // 5 seconds
    backgroundRefreshEnabled: true,
  },
  ui: {
    defaultPageSize: 20,
    maxPageSize: 100,
    animationsEnabled: true,
    autoRefreshEnabled: true,
  },
  development: {
    enableLogging: true,
    enableDevTools: true,
    mockApiDelay: 0,
  },
  features: {
    realTimeUpdates: true,
    infiniteScrolling: true,
    keyboardNavigation: true,
    offlineSupport: false, // Disabled in development
    advancedMetrics: true,
  },
  performance: {
    prefetchRange: 2,
    imageOptimization: false,
    lazyLoading: true,
    bundleAnalysis: true,
  },
};

/**
 * Production environment configuration
 */
const productionConfig: EnvironmentConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE || '',
    timeout: 30000,
    retries: 3,
  },
  cache: {
    defaultStaleTime: 30 * 1000, // 30 seconds
    defaultCacheTime: 10 * 60 * 1000, // 10 minutes
    maxMemoryUsage: 100, // 100MB
  },
  realTime: {
    defaultPollingInterval: 30 * 1000, // 30 seconds
    fastPollingInterval: 10 * 1000, // 10 seconds
    backgroundRefreshEnabled: true,
  },
  ui: {
    defaultPageSize: 50,
    maxPageSize: 200,
    animationsEnabled: true,
    autoRefreshEnabled: true,
  },
  development: {
    enableLogging: false,
    enableDevTools: false,
    mockApiDelay: 0,
  },
  features: {
    realTimeUpdates: true,
    infiniteScrolling: true,
    keyboardNavigation: true,
    offlineSupport: true,
    advancedMetrics: true,
  },
  performance: {
    prefetchRange: 3,
    imageOptimization: true,
    lazyLoading: true,
    bundleAnalysis: false,
  },
};

/**
 * Test environment configuration
 */
const testConfig: EnvironmentConfig = {
  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 5000,
    retries: 1,
  },
  cache: {
    defaultStaleTime: 0, // No caching in tests
    defaultCacheTime: 0,
    maxMemoryUsage: 10, // 10MB
  },
  realTime: {
    defaultPollingInterval: 1000, // 1 second for faster tests
    fastPollingInterval: 500, // 500ms
    backgroundRefreshEnabled: false,
  },
  ui: {
    defaultPageSize: 10,
    maxPageSize: 50,
    animationsEnabled: false, // Disable animations for tests
    autoRefreshEnabled: false,
  },
  development: {
    enableLogging: false,
    enableDevTools: false,
    mockApiDelay: 100, // Small delay for testing async behavior
  },
  features: {
    realTimeUpdates: false,
    infiniteScrolling: false,
    keyboardNavigation: true,
    offlineSupport: false,
    advancedMetrics: false,
  },
  performance: {
    prefetchRange: 1,
    imageOptimization: false,
    lazyLoading: false,
    bundleAnalysis: false,
  },
};

/**
 * Get the current environment
 */
function getCurrentEnvironment(): 'development' | 'production' | 'test' {
  if (import.meta.env.MODE === 'test') {
    return 'test';
  }
  
  if (import.meta.env.PROD) {
    return 'production';
  }
  
  return 'development';
}

/**
 * Validate environment configuration
 */
function validateConfig(config: EnvironmentConfig): void {
  // Validate API configuration
  if (!config.api.baseUrl) {
    throw new Error('API base URL is required');
  }
  
  if (config.api.timeout <= 0) {
    throw new Error('API timeout must be positive');
  }
  
  if (config.api.retries < 0) {
    throw new Error('API retries must be non-negative');
  }
  
  // Validate polling intervals
  if (config.realTime.defaultPollingInterval <= 0) {
    throw new Error('Default polling interval must be positive');
  }
  
  if (config.realTime.fastPollingInterval <= 0) {
    throw new Error('Fast polling interval must be positive');
  }
  
  // Validate page sizes
  if (config.ui.defaultPageSize <= 0) {
    throw new Error('Default page size must be positive');
  }
  
  if (config.ui.maxPageSize < config.ui.defaultPageSize) {
    throw new Error('Max page size must be >= default page size');
  }
  
  // Validate cache settings
  if (config.cache.defaultStaleTime < 0) {
    throw new Error('Default stale time must be non-negative');
  }
  
  if (config.cache.defaultCacheTime < 0) {
    throw new Error('Default cache time must be non-negative');
  }
}

/**
 * Get configuration for current environment
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();
  
  let config: EnvironmentConfig;
  
  switch (env) {
    case 'production':
      config = productionConfig;
      break;
    case 'test':
      config = testConfig;
      break;
    default:
      config = developmentConfig;
      break;
  }
  
  // Override with environment variables if provided
  const overriddenConfig = {
    ...config,
    api: {
      ...config.api,
      baseUrl: import.meta.env.VITE_API_BASE || config.api.baseUrl,
      timeout: import.meta.env.VITE_API_TIMEOUT 
        ? parseInt(import.meta.env.VITE_API_TIMEOUT) 
        : config.api.timeout,
      retries: import.meta.env.VITE_API_RETRIES
        ? parseInt(import.meta.env.VITE_API_RETRIES)
        : config.api.retries,
    },
    realTime: {
      ...config.realTime,
      defaultPollingInterval: import.meta.env.VITE_POLLING_INTERVAL
        ? parseInt(import.meta.env.VITE_POLLING_INTERVAL)
        : config.realTime.defaultPollingInterval,
      backgroundRefreshEnabled: import.meta.env.VITE_BACKGROUND_REFRESH
        ? import.meta.env.VITE_BACKGROUND_REFRESH === 'true'
        : config.realTime.backgroundRefreshEnabled,
    },
    development: {
      ...config.development,
      enableLogging: import.meta.env.VITE_ENABLE_LOGGING
        ? import.meta.env.VITE_ENABLE_LOGGING === 'true'
        : config.development.enableLogging,
      enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS
        ? import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true'
        : config.development.enableDevTools,
    },
    features: {
      ...config.features,
      realTimeUpdates: import.meta.env.VITE_REAL_TIME_UPDATES
        ? import.meta.env.VITE_REAL_TIME_UPDATES === 'true'
        : config.features.realTimeUpdates,
      infiniteScrolling: import.meta.env.VITE_INFINITE_SCROLLING
        ? import.meta.env.VITE_INFINITE_SCROLLING === 'true'
        : config.features.infiniteScrolling,
      keyboardNavigation: import.meta.env.VITE_KEYBOARD_NAVIGATION
        ? import.meta.env.VITE_KEYBOARD_NAVIGATION === 'true'
        : config.features.keyboardNavigation,
      offlineSupport: import.meta.env.VITE_OFFLINE_SUPPORT
        ? import.meta.env.VITE_OFFLINE_SUPPORT === 'true'
        : config.features.offlineSupport,
      advancedMetrics: import.meta.env.VITE_ADVANCED_METRICS
        ? import.meta.env.VITE_ADVANCED_METRICS === 'true'
        : config.features.advancedMetrics,
    },
  };
  
  validateConfig(overriddenConfig);
  return overriddenConfig;
}

/**
 * Current environment configuration
 */
export const config = getEnvironmentConfig();

/**
 * Environment utilities
 */
export const env = {
  /**
   * Current environment name
   */
  current: getCurrentEnvironment(),
  
  /**
   * Check if running in development
   */
  isDevelopment: getCurrentEnvironment() === 'development',
  
  /**
   * Check if running in production
   */
  isProduction: getCurrentEnvironment() === 'production',
  
  /**
   * Check if running in test
   */
  isTest: getCurrentEnvironment() === 'test',
  
  /**
   * Get a specific config value with type safety
   */
  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return config[key];
  },
  
  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return config.features[feature];
  },
  
  /**
   * Get API configuration
   */
  getApiConfig() {
    return config.api;
  },
  
  /**
   * Get cache configuration
   */
  getCacheConfig() {
    return config.cache;
  },
  
  /**
   * Get real-time configuration
   */
  getRealTimeConfig() {
    return config.realTime;
  },
};

/**
 * Environment-specific logger
 */
export const logger = {
  debug: (...args: any[]) => {
    if (config.development.enableLogging) {
      console.debug('[Continuum]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (config.development.enableLogging) {
      console.info('[Continuum]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (config.development.enableLogging) {
      console.warn('[Continuum]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    if (config.development.enableLogging) {
      console.error('[Continuum]', ...args);
    }
  },
  
  group: (label: string, ...args: any[]) => {
    if (config.development.enableLogging) {
      console.group(`[Continuum] ${label}`, ...args);
    }
  },
  
  groupEnd: () => {
    if (config.development.enableLogging) {
      console.groupEnd();
    }
  },
};

/**
 * Performance monitoring utilities
 */
export const performance = {
  /**
   * Mark performance timing
   */
  mark: (name: string) => {
    if (config.development.enableLogging && typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`continuum-${name}`);
    }
  },
  
  /**
   * Measure performance between marks
   */
  measure: (name: string, startMark: string, endMark?: string) => {
    if (config.development.enableLogging && typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(
          `continuum-${name}`,
          `continuum-${startMark}`,
          endMark ? `continuum-${endMark}` : undefined
        );
      } catch (error) {
        logger.warn('Performance measurement failed:', error);
      }
    }
  },
  
  /**
   * Get performance entries
   */
  getEntries: (type?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      return window.performance.getEntriesByType(type || 'measure')
        .filter(entry => entry.name.startsWith('continuum-'));
    }
    return [];
  },
};

/**
 * Feature flag utilities
 */
export const features = {
  /**
   * Check if real-time updates are enabled
   */
  get realTimeUpdates() {
    return config.features.realTimeUpdates;
  },
  
  /**
   * Check if infinite scrolling is enabled
   */
  get infiniteScrolling() {
    return config.features.infiniteScrolling;
  },
  
  /**
   * Check if keyboard navigation is enabled
   */
  get keyboardNavigation() {
    return config.features.keyboardNavigation;
  },
  
  /**
   * Check if offline support is enabled
   */
  get offlineSupport() {
    return config.features.offlineSupport;
  },
  
  /**
   * Check if advanced metrics are enabled
   */
  get advancedMetrics() {
    return config.features.advancedMetrics;
  },
};

/**
 * Export individual configs for direct access
 */
export { developmentConfig, productionConfig, testConfig };

/**
 * Default export
 */
export default config;