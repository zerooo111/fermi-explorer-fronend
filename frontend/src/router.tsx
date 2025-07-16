import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Layout from '@/components/Layout'
import Homepage from '@/pages/Homepage'
import TransactionPage from '@/pages/TransactionPage'
import TickPage from '@/pages/TickPage'

// Create the root route with layout
export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout />
      <TanStackRouterDevtools />
    </>
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
  path: '/transaction/$transactionId',
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
