import type { router } from "../router";

// Infer the type of the router
export type Router = typeof router;

// Export route paths for type-safe navigation
export type RoutePaths =
	| "/"
	| "/transaction/$transactionId"
	| "/tick/$tickId"
	| "*";

// Route params type
export interface RouteParams {
	"/transaction/$transactionId": {
		transactionId: string;
	};
	"/tick/$tickId": {
		tickId: string;
	};
}

// Search params type (can be extended as needed)
export type SearchParams = {};
