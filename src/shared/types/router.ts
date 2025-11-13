import type { router } from "../../router";

// Infer the type of the router
export type Router = typeof router;

// Export route paths for type-safe navigation
export type RoutePaths = "/" | "/tx/$transactionId" | "/tick/$tickId" | "*";

// Route params type
export interface RouteParams {
  "/tx/$transactionId": {
    transactionId: string;
  };
  "/tick/$tickId": {
    tickId: string;
  };
}

// Search params type (can be extended as needed)
export type SearchParams = {};
