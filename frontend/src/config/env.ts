/**
 * Environment Configuration - Single Source of Truth
 * 
 * Centralized environment variable access and configuration management.
 * All environment variables should be accessed through this module.
 */

import { getEnvString, getEnvNumber, getEnvBoolean, isDevelopment, isProduction } from '../utils/env';

/**
 * Environment Configuration Interface
 * Defines the complete structure of all environment-based configuration
 */
export interface EnvironmentConfig {
  // Environment Info
  mode: 'development' | 'production' | 'test';
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  
  // Cache Configuration
  cache: {
    defaultStaleTime: number;
    defaultCacheTime: number;
    maxMemoryUsage: number; // in MB
  };
  
  // Real-time Updates Configuration
  realTime: {
    defaultPollingInterval: number;
    fastPollingInterval: number;
    backgroundRefreshEnabled: boolean;
  };
  
  // UI Configuration
  ui: {
    defaultPageSize: number;
    maxPageSize: number;
    animationsEnabled: boolean;
    autoRefreshEnabled: boolean;
  };
  
  // Development Configuration
  development: {
    enableLogging: boolean;
    enableDevTools: boolean;
    mockApiDelay: number;
  };
  
  // Feature Flags
  features: {
    realTimeUpdates: boolean;
    infiniteScrolling: boolean;
    keyboardNavigation: boolean;
    offlineSupport: boolean;
    advancedMetrics: boolean;
  };
  
  // Performance Configuration
  performance: {
    prefetchRange: number;
    imageOptimization: boolean;
    lazyLoading: boolean;
    bundleAnalysis: boolean;
  };
}

/**
 * Parse and validate all environment variables
 * This is the ONLY place where import.meta.env should be accessed
 */
function parseEnvironmentVariables(): EnvironmentConfig {
  // Determine environment
  const mode = import.meta.env.MODE as 'development' | 'production' | 'test';
  const isDev = isDevelopment();
  const isProd = isProduction();
  const isTest = mode === 'test';
  
  return {
    // Environment Info
    mode,
    isDev,
    isProd,
    isTest,
    
    // API Configuration
    api: {
      baseUrl: getEnvString('VITE_API_BASE', 'http://localhost:3001'),
      timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
      retries: getEnvNumber('VITE_API_RETRIES', 3),
    },
    
    // Cache Configuration (environment-specific defaults)
    cache: {
      defaultStaleTime: isProd ? 30000 : 10000, // 30s prod, 10s dev
      defaultCacheTime: isProd ? 600000 : 300000, // 10min prod, 5min dev
      maxMemoryUsage: isProd ? 100 : 50, // 100MB prod, 50MB dev
    },
    
    // Real-time Updates Configuration
    realTime: {
      defaultPollingInterval: getEnvNumber('VITE_POLLING_INTERVAL', isProd ? 30000 : 10000),
      fastPollingInterval: isProd ? 10000 : 5000, // 10s prod, 5s dev
      backgroundRefreshEnabled: getEnvBoolean('VITE_BACKGROUND_REFRESH', true),
    },
    
    // UI Configuration (environment-specific defaults)
    ui: {
      defaultPageSize: isProd ? 50 : 20,
      maxPageSize: isProd ? 200 : 100,
      animationsEnabled: true,
      autoRefreshEnabled: true,
    },
    
    // Development Configuration
    development: {
      enableLogging: getEnvBoolean('VITE_ENABLE_LOGGING', isDev),
      enableDevTools: getEnvBoolean('VITE_ENABLE_DEV_TOOLS', isDev),
      mockApiDelay: isTest ? 100 : 0,
    },
    
    // Feature Flags
    features: {
      realTimeUpdates: getEnvBoolean('VITE_REAL_TIME_UPDATES', true),
      infiniteScrolling: getEnvBoolean('VITE_INFINITE_SCROLLING', true),
      keyboardNavigation: getEnvBoolean('VITE_KEYBOARD_NAVIGATION', true),
      offlineSupport: getEnvBoolean('VITE_OFFLINE_SUPPORT', false),
      advancedMetrics: getEnvBoolean('VITE_ADVANCED_METRICS', true),
    },
    
    // Performance Configuration (environment-specific)
    performance: {
      prefetchRange: isProd ? 3 : 2,
      imageOptimization: isProd,
      lazyLoading: true,
      bundleAnalysis: isDev,
    },
  };
}

/**
 * Validate the configuration
 */
function validateConfig(config: EnvironmentConfig): void {
  // Validate API configuration
  if (!config.api.baseUrl) {
    throw new Error('VITE_API_BASE is required');
  }
  
  if (config.api.timeout <= 0) {
    throw new Error('VITE_API_TIMEOUT must be a positive number');
  }
  
  if (config.api.retries < 0) {
    throw new Error('VITE_API_RETRIES must be non-negative');
  }
  
  // Validate polling intervals
  if (config.realTime.defaultPollingInterval <= 0) {
    throw new Error('VITE_POLLING_INTERVAL must be a positive number');
  }
  
  // Validate page sizes
  if (config.ui.defaultPageSize <= 0) {
    throw new Error('Default page size must be positive');
  }
  
  if (config.ui.maxPageSize < config.ui.defaultPageSize) {
    throw new Error('Max page size must be >= default page size');
  }
}

/**
 * Create and validate the environment configuration
 */
function createEnvironmentConfig(): EnvironmentConfig {
  const config = parseEnvironmentVariables();
  validateConfig(config);
  return config;
}

/**
 * Single source of truth for all environment configuration
 * This is the only export that should be used throughout the application
 */
export const env = createEnvironmentConfig();

/**
 * Convenience getters for commonly used configuration
 */
export const envConfig = {
  // Environment
  get isDev() { return env.isDev; },
  get isProd() { return env.isProd; },
  get isTest() { return env.isTest; },
  get mode() { return env.mode; },
  
  // API
  get apiBaseUrl() { return env.api.baseUrl; },
  get apiTimeout() { return env.api.timeout; },
  get apiRetries() { return env.api.retries; },
  
  // Real-time
  get pollingInterval() { return env.realTime.defaultPollingInterval; },
  get backgroundRefresh() { return env.realTime.backgroundRefreshEnabled; },
  
  // Development
  get enableLogging() { return env.development.enableLogging; },
  get enableDevTools() { return env.development.enableDevTools; },
  
  // Features
  get realTimeUpdates() { return env.features.realTimeUpdates; },
  get infiniteScrolling() { return env.features.infiniteScrolling; },
  get keyboardNavigation() { return env.features.keyboardNavigation; },
  get offlineSupport() { return env.features.offlineSupport; },
  get advancedMetrics() { return env.features.advancedMetrics; },
} as const;

/**
 * Log the configuration (development only)
 */
export function logEnvironmentConfig(): void {
  if (!env.development.enableLogging) {
    return;
  }
  
  console.group('🔧 Environment Configuration');
  console.table({
    Mode: env.mode,
    'API Base': env.api.baseUrl,
    'API Timeout': `${env.api.timeout}ms`,
    'Polling Interval': `${env.realTime.defaultPollingInterval}ms`,
    'Logging Enabled': env.development.enableLogging,
    'Dev Tools': env.development.enableDevTools,
    'Real-time Updates': env.features.realTimeUpdates,
    'Infinite Scrolling': env.features.infiniteScrolling,
    'Offline Support': env.features.offlineSupport,
  });
  console.groupEnd();
}

/**
 * Initialize and validate environment configuration
 */
export function initializeEnvironment(): void {
  try {
    // The configuration is already created and validated during module load
    logEnvironmentConfig();
    
    if (env.development.enableLogging) {
      console.log('✅ Environment configuration loaded successfully');
    }
  } catch (error) {
    console.error('❌ Environment Configuration Error:', error);
    throw error;
  }
}

/**
 * Get specific configuration sections
 */
export const getApiConfig = () => env.api;
export const getCacheConfig = () => env.cache;
export const getRealTimeConfig = () => env.realTime;
export const getUIConfig = () => env.ui;
export const getDevelopmentConfig = () => env.development;
export const getFeatureFlags = () => env.features;
export const getPerformanceConfig = () => env.performance;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof env.features): boolean => {
  return env.features[feature];
};