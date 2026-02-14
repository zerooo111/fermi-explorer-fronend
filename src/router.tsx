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
import ContinuumLiveStreamPage from "@/features/continuum/pages/LiveStreamPage";
import RollupHomepage from "@/features/rollup/pages/RollupHomepage";
import RollupBlocksPage from "@/features/rollup/pages/BlocksPage";
import RollupBlockDetailPage from "@/features/rollup/pages/BlockDetailPage";
import RollupTransactionPage from "@/features/rollup/pages/TransactionPage";
import RollupAddressPage from "@/features/rollup/pages/AddressPage";
import RollupMarketsPage from "@/features/rollup/pages/MarketsPage";
import RollupMarketDetailPage from "@/features/rollup/pages/MarketDetailPage";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

/* Create the root route with layout and error boundary */
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

// Index route - redirect to sequencing
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: "/sequencing",
    });
  },
});

// Sequencing routes (formerly Continuum)
const sequencingIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sequencing",
  component: ContinuumHomepage,
});

const sequencingLiveStreamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sequencing/live",
  component: ContinuumLiveStreamPage,
});

const sequencingTransactionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sequencing/tx/$transactionId",
  component: ContinuumTransactionPage,
});

const sequencingTickRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sequencing/tick/$tickId",
  component: ContinuumTickPage,
});

// Execution routes (formerly Rollup)
const executionIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/execution",
  component: RollupHomepage,
});

const executionBlocksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/execution/blocks",
  component: RollupBlocksPage,
});

const executionBlockDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/execution/blocks/$height",
  component: RollupBlockDetailPage,
});

const executionTransactionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/execution/transactions/$id",
  component: RollupTransactionPage,
});

const executionMarketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/execution/markets",
  component: RollupMarketsPage,
});

const executionMarketDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/execution/markets/$marketId",
  component: RollupMarketDetailPage,
});

const executionAddressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/execution/address/$pubkey",
  component: RollupAddressPage,
});

// 404 Not Found route - redirect to sequencing
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  beforeLoad: () => {
    throw redirect({
      to: "/sequencing",
    });
  },
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  sequencingIndexRoute,
  sequencingLiveStreamRoute,
  sequencingTransactionRoute,
  sequencingTickRoute,
  executionIndexRoute,
  executionBlocksRoute,
  executionBlockDetailRoute,
  executionMarketsRoute,
  executionMarketDetailRoute,
  executionTransactionRoute,
  executionAddressRoute,
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
