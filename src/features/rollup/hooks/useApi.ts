// React Query hooks for Rollup API integration

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { rollupRoutes } from "@/shared/lib/routes";
import type {
	NodeStatus,
	MarketsResponse,
	BlockWithDetails,
	BlocksListResponse,
	Transaction,
	EventsResponse,
	Block,
} from "@/features/rollup/types/api";

// Node status
export function useStatus() {
	return useQuery<NodeStatus>({
		queryKey: ["rollup", "status"],
		queryFn: async () => {
			const response = await axios.get<NodeStatus>(rollupRoutes.STATUS);
			return response.data;
		},
		refetchInterval: 5000, // Poll every 5 seconds
	});
}

// Markets
export function useMarkets() {
	return useQuery<MarketsResponse>({
		queryKey: ["rollup", "markets"],
		queryFn: async () => {
			const response = await axios.get<MarketsResponse>(rollupRoutes.MARKETS);
			return response.data;
		},
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
	});
}

// Latest block
export function useLatestBlock() {
	return useQuery<BlockWithDetails>({
		queryKey: ["rollup", "blocks", "latest"],
		queryFn: async () => {
			const response = await axios.get<BlockWithDetails>(rollupRoutes.LATEST_BLOCK);
			return response.data;
		},
		refetchInterval: 1000, // Poll every second for real-time feel
	});
}

// Specific block by height
export function useBlock(height: number | undefined) {
	return useQuery<BlockWithDetails>({
		queryKey: ["rollup", "blocks", height],
		queryFn: async () => {
			if (height === undefined) {
				throw new Error("Block height is required");
			}
			const response = await axios.get<BlockWithDetails>(rollupRoutes.BLOCK(height));
			return response.data;
		},
		enabled: height !== undefined,
	});
}

// Block list with pagination
export function useBlocks(limit = 20, offset = 0) {
	return useQuery<BlocksListResponse>({
		queryKey: ["rollup", "blocks", { limit, offset }],
		queryFn: async () => {
			const response = await axios.get<Block[]>(rollupRoutes.BLOCKS(limit, offset));
			// API returns an array directly, wrap it in the expected format
			return {
				blocks: response.data,
				total: response.data.length, // Note: API doesn't provide total count
				limit,
				offset,
			};
		},
		refetchInterval: 3000, // Poll every 3 seconds for block list updates
	});
}

// Specific transaction
export function useTransaction(id: string | undefined) {
	return useQuery<Transaction>({
		queryKey: ["rollup", "transactions", id],
		queryFn: async () => {
			if (!id) {
				throw new Error("Transaction ID is required");
			}
			const response = await axios.get<Transaction>(rollupRoutes.TRANSACTION(id));
			return response.data;
		},
		enabled: !!id,
		retry: (failureCount, error: any) => {
			// Don't retry 404s
			if (error?.response?.status === 404 || error?.message === "Resource not found") {
				return false;
			}
			return failureCount < 3;
		},
	});
}

// Events with optional market filter
export function useEvents(marketId?: string, limit = 20, offset = 0) {
	return useQuery<EventsResponse>({
		queryKey: ["rollup", "events", { marketId, limit, offset }],
		queryFn: async () => {
			const response = await axios.get<EventsResponse>(rollupRoutes.EVENTS(marketId, limit, offset));
			return response.data;
		},
	});
}

