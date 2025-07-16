/**
 * TanStack Query Provider Configuration
 * 
 * Centralized setup for TanStack Query with optimized defaults,
 * error handling, and development tools integration.
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { env, envConfig } from '../config/env';
import { isApiError } from '../api/client';

/**
 * Create and configure the QueryClient instance
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global query defaults
        staleTime: env.cache.defaultStaleTime,
        gcTime: env.cache.defaultCacheTime,
        
        // Error handling
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (except 429)
          if (isApiError(error) && error.status >= 400 && error.status < 500 && error.status !== 429) {
            return false;
          }
          
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        
        retryDelay: (attemptIndex) => {
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
        
        // Background refetch settings
        refetchOnWindowFocus: env.realTime.backgroundRefreshEnabled,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Network mode
        networkMode: env.features.offlineSupport ? 'offlineFirst' : 'online',
      },
      
      mutations: {
        // Global mutation defaults
        retry: (failureCount, error) => {
          // Don't retry mutations on client errors
          if (isApiError(error) && error.status >= 400 && error.status < 500) {
            return false;
          }
          
          // Retry once for server errors
          return failureCount < 1;
        },
        
        retryDelay: 1000,
        
        // Network mode
        networkMode: env.features.offlineSupport ? 'offlineFirst' : 'online',
      },
    },
  });
}

/**
 * Query client instance
 */
let queryClient: QueryClient | null = null;

/**
 * Get or create the query client instance
 */
export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = createQueryClient();
    
    // Add global error handler
    queryClient.getQueryCache().subscribe((event) => {
      // Log errors in development
      if (envConfig.enableLogging && event.query.state.error) {
        console.error('Query error:', event.query.state.error);
      }
    });
    
    // Performance monitoring
    if (envConfig.enableLogging) {
      queryClient.getQueryCache().subscribe((event) => {
        if (event.query.state.dataUpdatedAt) {
          const executionTime = Date.now() - event.query.state.dataUpdatedAt;
          
          if (executionTime > 1000) { // Log slow queries (> 1s)
            console.warn(`Slow query detected: ${event.query.queryHash} took ${executionTime}ms`);
          }
        }
      });
    }
  }
  
  return queryClient;
}

/**
 * Props for QueryProvider
 */
interface QueryProviderProps {
  children: React.ReactNode;
  client?: QueryClient;
}

/**
 * Query Provider component with configuration and dev tools
 */
export function QueryProvider({ children, client }: QueryProviderProps) {
  const queryClientInstance = client || getQueryClient();
  
  return (
    <QueryClientProvider client={queryClientInstance}>
      {children}
      
      {/* Development tools */}
      {envConfig.isDev && envConfig.enableDevTools && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}

/**
 * Hook to access the query client
 */
export function useQueryClient() {
  return getQueryClient();
}

/**
 * Utility functions for query management
 */
export const queryUtils = {
  /**
   * Clear all queries
   */
  clearAll: () => {
    const client = getQueryClient();
    client.clear();
    if (envConfig.enableLogging) console.info('All queries cleared');
  },
  
  /**
   * Invalidate all queries
   */
  invalidateAll: () => {
    const client = getQueryClient();
    client.invalidateQueries();
    if (envConfig.enableLogging) console.info('All queries invalidated');
  },
  
  /**
   * Remove stale queries
   */
  removeStale: () => {
    const client = getQueryClient();
    client.removeQueries({ stale: true });
    if (envConfig.enableLogging) console.info('Stale queries removed');
  },
  
  /**
   * Get cache statistics
   */
  getCacheStats: () => {
    const client = getQueryClient();
    const queryCache = client.getQueryCache();
    const mutationCache = client.getMutationCache();
    
    const queries = queryCache.getAll();
    const mutations = mutationCache.getAll();
    
    const stats = {
      queries: {
        total: queries.length,
        stale: queries.filter(q => q.isStale()).length,
        fetching: queries.filter(q => q.state.status === 'pending').length,
        errors: queries.filter(q => q.state.error).length,
      },
      mutations: {
        total: mutations.length,
        pending: mutations.filter(m => m.state.status === 'pending').length,
        errors: mutations.filter(m => m.state.error).length,
      },
      memoryUsage: {
        // Rough estimate of memory usage
        queriesSize: queries.length * 1024, // 1KB per query estimate
        mutationsSize: mutations.length * 256, // 256B per mutation estimate
      },
    };
    
    return stats;
  },
  
  /**
   * Log cache statistics
   */
  logCacheStats: () => {
    if (!envConfig.enableLogging) return;
    const stats = queryUtils.getCacheStats();
    console.group('Query Cache Statistics');
    console.info('Queries:', stats.queries);
    console.info('Mutations:', stats.mutations);
    console.info('Memory Usage (estimated):', stats.memoryUsage);
    console.groupEnd();
  },
  
  /**
   * Perform cache cleanup
   */
  cleanup: () => {
    const client = getQueryClient();
    
    // Remove stale queries
    client.removeQueries({ stale: true });
    
    // Remove error queries older than 5 minutes
    client.removeQueries({
      predicate: (query) => {
        return !!(query.state.error && 
               query.state.errorUpdatedAt && 
               query.state.errorUpdatedAt < Date.now() - 5 * 60 * 1000);
      },
    });
    
    if (envConfig.enableLogging) console.info('Cache cleanup completed');
  },
  
  /**
   * Set up automatic cache cleanup
   */
  setupAutoCleanup: (intervalMs: number = 5 * 60 * 1000) => {
    const interval = setInterval(() => {
      queryUtils.cleanup();
    }, intervalMs);
    
    if (envConfig.enableLogging) console.info(`Auto cleanup scheduled every ${intervalMs}ms`);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
      if (envConfig.enableLogging) console.info('Auto cleanup cancelled');
    };
  },
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Monitor query performance
   */
  monitorPerformance: () => {
    if (!envConfig.isDev) return;
    
    const client = getQueryClient();
    
    client.getQueryCache().subscribe((event) => {
      if (event.query.state.status === 'pending') {
        // console.debug(`Query started: ${event.query.queryHash}`);
      }
      
      if (event.query.state.status === 'success' && event.query.state.dataUpdatedAt) {
        const duration = Date.now() - event.query.state.dataUpdatedAt;
        // console.debug(`Query ${event.query.queryHash} completed in ${duration}ms`);
        
        if (duration > 2000) {
          console.warn(`Slow query detected: ${event.query.queryHash} took ${duration}ms`);
        }
      }
    });
  },
  
  /**
   * Enable verbose logging
   */
  enableVerboseLogging: () => {
    if (!envConfig.isDev) return;
    
    const client = getQueryClient();
    
    // Log all query state changes
    client.getQueryCache().subscribe((event) => {
      // console.debug('Query event:', event.type, event.query.queryHash);
    });
    
    // Log all mutation state changes
    client.getMutationCache().subscribe((event) => {
      if (event.mutation) {
        // console.debug('Mutation event:', event.type, event.mutation.mutationId);
      }
    });
    
    // console.info('Verbose logging enabled');
  },
};

/**
 * Initialize development features
 */
if (envConfig.isDev && envConfig.enableLogging) {
  // Auto setup performance monitoring
  devUtils.monitorPerformance();
  
  // Setup auto cleanup every 10 minutes in development
  queryUtils.setupAutoCleanup(10 * 60 * 1000);
  
  // Log cache stats every minute
  setInterval(() => {
    queryUtils.logCacheStats();
  }, 60 * 1000);
}