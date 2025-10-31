import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import Layout from '@/components/Layout'
import Homepage from '@/pages/Homepage'
import TransactionPage from '@/pages/TransactionPage'
import TickPage from '@/pages/TickPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Create the root route with layout and error boundary
export const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to monitoring service in production
        console.error('Route Error:', error, errorInfo);
        
        // In production, send to error tracking service
        if (import.meta.env.PROD) {
          // Example: Sentry.captureException(error, { extra: errorInfo });
        }
      }}
    >
      <Layout />
    </ErrorBoundary>
  ),
})

// Create the index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Homepage,
})

// About route
const transactionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tx/$transactionId',
  component: TransactionPage,
})

// Dashboard route
const tickRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tick/$tickId',
  component: TickPage,
})

// 404 Not Found route - redirect to homepage
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  beforeLoad: () => {
    throw redirect({
      to: '/',
    })
  },
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  transactionRoute,
  tickRoute,
  notFoundRoute,
])

// Create the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
