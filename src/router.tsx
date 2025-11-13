import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Layout from "@/shared/components/Layout";
import ContinuumHomepage from "@/features/continuum/pages/ContinuumHomepage";
import ContinuumTransactionPage from "@/features/continuum/pages/TransactionPage";
import ContinuumTickPage from "@/features/continuum/pages/TickPage";
import RollupHomepage from "@/features/rollup/pages/RollupHomepage";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

// Create the root route with layout and error boundary
export const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to monitoring service in production
        console.error("Route Error:", error, errorInfo);

        // In production, send to error tracking service
        if (import.meta.env.PROD) {
          // Example: Sentry.captureException(error, { extra: errorInfo });
        }
      }}
    >
      <Layout />
    </ErrorBoundary>
  ),
});

// Index route - redirect to continuum
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: "/continuum",
    });
  },
});

// Continuum routes
const continuumIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/continuum",
  component: ContinuumHomepage,
});

const continuumTransactionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/continuum/tx/$transactionId",
  component: ContinuumTransactionPage,
});

const continuumTickRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/continuum/tick/$tickId",
  component: ContinuumTickPage,
});

// Rollup routes
const rollupIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rollup",
  component: RollupHomepage,
});

// 404 Not Found route - redirect to continuum
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  beforeLoad: () => {
    throw redirect({
      to: "/continuum",
    });
  },
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  continuumIndexRoute,
  continuumTransactionRoute,
  continuumTickRoute,
  rollupIndexRoute,
  notFoundRoute,
]);

// Create the router
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register the router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
