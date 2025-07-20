# Continuum Sequencer Data Providers

A comprehensive TanStack Query-based data layer for the Continuum Sequencer frontend, designed with senior-level engineering practices for maintainability, performance, and developer experience.

## Overview

This data provider library provides:

- **Type-safe API integration** with full TypeScript support
- **Intelligent caching strategies** optimized for blockchain data patterns
- **Real-time updates** with configurable polling and background refresh
- **Comprehensive error handling** with retry logic and network resilience
- **Performance optimization** with prefetching, pagination, and memory management
- **Developer experience** with extensive examples and debugging tools

## Quick Start

### 1. Installation

```bash
npm install @tanstack/react-query
```

### 2. Setup Provider

```tsx
import { QueryProvider } from './providers/QueryProvider';
import { ContinuumDashboard } from './examples/usage-examples';

function App() {
  return (
    <QueryProvider>
      <ContinuumDashboard />
    </QueryProvider>
  );
}
```

### 3. Use Hooks

```tsx
import { useStatus, useRecentTicks, useTransaction } from './hooks';

function MyComponent() {
  // Get real-time sequencer status
  const { metrics, isLive } = useStatus({
    enableRealTime: true,
    trackPerformance: true,
  });

  // Get recent ticks with live updates
  const { result, refresh } = useRecentTicks({
    limit: 20,
    enableRealTime: true,
    enhanceData: true,
  });

  // Look up specific transaction
  const { result: txResult } = useTransaction(hash, {
    enhanceData: true,
  });

  return <div>{/* Your UI */}</div>;
}
```

## Architecture

### File Structure

```
src/
├── api/
│   ├── client.ts          # HTTP client with error handling
│   ├── types.ts           # TypeScript interfaces
│   └── queryKeys.ts       # Query key factory
├── hooks/
│   ├── useHealth.ts       # Health monitoring
│   ├── useStatus.ts       # Status and metrics
│   ├── useTransaction.ts  # Transaction lookup
│   ├── useTick.ts        # Tick retrieval
│   ├── useRecentTicks.ts # Recent ticks with pagination
│   └── index.ts          # Barrel exports
├── config/
│   └── environment.ts    # Environment configuration
├── providers/
│   └── QueryProvider.tsx # TanStack Query setup
└── examples/
    └── usage-examples.tsx # Component examples
```

### Design Principles

1. **Separation of Concerns**: Data fetching logic is completely separate from UI components
2. **Type Safety**: Full TypeScript integration with runtime validation
3. **Performance First**: Optimized caching, prefetching, and background updates
4. **Error Resilience**: Comprehensive error handling with intelligent retry logic
5. **Developer Experience**: Rich debugging tools and extensive documentation

## API Reference

### Core Hooks

#### Health Monitoring

```tsx
const { isHealthy, connectionStatus } = useHealth({
  enablePolling: true,
  pollingInterval: 30000,
  onConnectionLost: () => console.log('Connection lost'),
});
```

#### Status and Metrics

```tsx
const { metrics, performance, trends } = useStatus({
  enableRealTime: true,
  trackPerformance: true,
  onMetricsChange: (metrics) => {
    if (metrics.transactionChange > 1000) {
      showNotification(`${metrics.transactionChange} new transactions`);
    }
  },
});
```

#### Transaction Lookup

```tsx
const { result, found, isValidHash } = useTransaction(hash, {
  enhanceData: true,
  onTransactionFound: (tx) => console.log('Found:', tx),
});
```

#### Tick Navigation

```tsx
const { 
  currentTick, 
  result, 
  goToNext, 
  goToPrevious 
} = useTickNavigation(initialTick, {
  prefetchRange: 2,
  enableKeyboard: true,
});
```

#### Recent Ticks

```tsx
const { result, nextPage, refresh } = useRecentTicks({
  limit: 20,
  enableRealTime: true,
  onNewTicks: (newTicks) => {
    toast.info(`${newTicks.length} new ticks available`);
  },
});
```

### Advanced Hooks

#### Infinite Scrolling

```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteRecentTicks({
  pageSize: 20,
  enableRealTime: true,
});
```

#### Real-time Monitoring

```tsx
const {
  latestTick,
  newTicksCount,
  isMonitoring,
  startMonitoring,
  stopMonitoring
} = useTickMonitor({
  interval: 5000,
  onNewTick: (tick) => playNotificationSound(),
});
```

## Configuration

### Environment Variables

```env
# API Configuration (Vite requires VITE_ prefix)
VITE_API_BASE=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=3

# Real-time Updates
VITE_POLLING_INTERVAL=10000
VITE_BACKGROUND_REFRESH=true

# Development
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEV_TOOLS=true

# Feature Flags
VITE_REAL_TIME_UPDATES=true
VITE_INFINITE_SCROLLING=true
VITE_KEYBOARD_NAVIGATION=true
VITE_OFFLINE_SUPPORT=false
VITE_ADVANCED_METRICS=true
```

### Cache Configuration

The library uses intelligent caching strategies:

```typescript
const cacheConfig = {
  // Health checks: 30-second stale time
  health: { staleTime: 30 * 1000 },
  
  // Status: 10-second stale time with background refetch
  status: { staleTime: 10 * 1000, refetchInterval: 30 * 1000 },
  
  // Transactions/Ticks: Never stale (immutable data)
  transactions: { staleTime: Infinity },
  ticks: { staleTime: Infinity },
  
  // Recent ticks: 5-second stale time with live updates
  recentTicks: { staleTime: 5 * 1000, refetchInterval: 10 * 1000 },
};
```

## Performance Features

### Intelligent Caching

- **Immutable data** (transactions, ticks) cached indefinitely
- **Dynamic data** (status, recent ticks) with short stale times
- **Background refetching** for real-time updates
- **Memory management** with automatic cleanup

### Prefetching

```tsx
// Automatic prefetching of adjacent ticks
const { currentTick, prefetchedTicks } = useTickNavigation(100, {
  prefetchRange: 2, // Prefetch ±2 ticks
});
```

### Pagination

```tsx
// Efficient pagination with cache reuse
const { result, nextPage, previousPage } = useRecentTicks({
  limit: 20,
  offset: 0,
});
```

### Real-time Updates

```tsx
// Non-blocking background updates
const { isLive, lastUpdate } = useStatus({
  enableRealTime: true,
  pollingInterval: 10000, // 10 seconds
});
```

## Error Handling

### Automatic Retry Logic

```typescript
const retryConfig = {
  // Don't retry 4xx errors (except rate limiting)
  retry: (failureCount, error) => {
    if (isApiError(error) && error.status >= 400 && error.status < 500 && error.status !== 429) {
      return false;
    }
    return failureCount < 3;
  },
  
  // Exponential backoff
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};
```

### Error Types

```typescript
try {
  const data = await apiClient.get('/status');
} catch (error) {
  if (isApiError(error)) {
    console.log('API Error:', error.status, error.message);
  } else if (isNetworkError(error)) {
    console.log('Network Error:', error.message);
  }
}
```

## Development Tools

### Query DevTools

In development mode, the library includes React Query DevTools for debugging:

```tsx
// Automatically enabled in development
<QueryProvider>
  <App />
  {/* DevTools appear in bottom-right corner */}
</QueryProvider>
```

### Performance Monitoring

```typescript
import { performance, logger } from './config/environment';

// Mark performance points
performance.mark('query-start');
// ... query execution
performance.mark('query-end');
performance.measure('query-duration', 'query-start', 'query-end');

// Get performance entries
const entries = performance.getEntries('measure');
```

### Cache Utilities

```typescript
import { queryUtils } from './providers/QueryProvider';

// Get cache statistics
const stats = queryUtils.getCacheStats();

// Clear all cached data
queryUtils.clearAll();

// Remove stale queries
queryUtils.removeStale();

// Setup automatic cleanup
const cleanup = queryUtils.setupAutoCleanup(5 * 60 * 1000); // 5 minutes
```

## Testing

### Mock Data Provider

```tsx
import { QueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';

// Create test client with no caching
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 0 },
    mutations: { retry: false },
  },
});

function TestWrapper({ children }) {
  return (
    <QueryProvider client={testQueryClient}>
      {children}
    </QueryProvider>
  );
}
```

### Hook Testing

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useStatus } from './hooks';

test('useStatus returns sequencer metrics', async () => {
  const { result } = renderHook(() => useStatus(), {
    wrapper: TestWrapper,
  });

  await waitFor(() => {
    expect(result.current.metrics).toBeDefined();
  });

  expect(result.current.metrics?.chainHeight).toBeGreaterThan(0);
});
```

## Examples

See `src/examples/usage-examples.tsx` for comprehensive component examples including:

- **Health Indicator**: Connection status display
- **Metrics Dashboard**: Real-time performance metrics
- **Transaction Search**: Hash lookup with validation
- **Tick Navigator**: Navigation with keyboard controls
- **Recent Ticks List**: Live-updating tick feed
- **Infinite Scroll**: Seamless pagination
- **Complete Dashboard**: Full-featured example

## Best Practices

### 1. Use Appropriate Cache Times

```tsx
// For immutable data
const { data } = useTransaction(hash, {
  staleTime: Infinity, // Never refetch
});

// For dynamic data
const { data } = useStatus({
  enableRealTime: true,
  pollingInterval: 10000, // Refetch every 10s
});
```

### 2. Handle Loading States

```tsx
const { data, isLoading, isFetching, error } = useStatus();

if (isLoading) return <Spinner />; // Initial load
if (error) return <ErrorDisplay error={error} />;

return (
  <div>
    {isFetching && <RefreshIndicator />} {/* Background refresh */}
    <StatusDisplay data={data} />
  </div>
);
```

### 3. Optimize Re-renders

```tsx
// Use specific data selections
const chainHeight = useStatus({
  select: (data) => data?.chain_height,
});

// Or use memoization for complex data
const formattedMetrics = useMemo(() => {
  return formatMetrics(data);
}, [data]);
```

### 4. Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

## Migration Guide

If you're migrating from manual fetch calls:

### Before

```tsx
function StatusComponent() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/status')
      .then(r => r.json())
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>Height: {status?.chain_height}</div>;
}
```

### After

```tsx
function StatusComponent() {
  const { metrics, isLoading } = useStatus({
    enableRealTime: true,
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>Height: {metrics?.chainHeight}</div>;
}
```

## Contributing

1. Follow the established patterns for new hooks
2. Add comprehensive TypeScript types
3. Include usage examples in `examples/usage-examples.tsx`
4. Write tests for new functionality
5. Update documentation

## License

This project is part of the Continuum Sequencer monorepo.