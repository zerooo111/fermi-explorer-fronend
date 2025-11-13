// Utility functions for formatting blockchain data

/**
 * Format price from integer to decimal string
 * @param value - Price in smallest units
 * @param decimals - Number of decimal places (default: 6 for USDC)
 * @returns Formatted price string
 */
export function formatPrice(value: string | number, decimals = 6): string {
	const numValue =
		typeof value === "string" ? Number.parseInt(value, 10) : value;
	return (numValue / 10 ** decimals).toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: decimals,
	});
}

/**
 * Format quantity from integer to decimal string
 * @param value - Quantity in smallest units
 * @param decimals - Number of decimal places (default: 9 for SOL)
 * @returns Formatted quantity string
 */
export function formatQuantity(value: string | number, decimals = 9): string {
	const numValue =
		typeof value === "string" ? Number.parseInt(value, 10) : value;
	return (numValue / 10 ** decimals).toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: decimals,
	});
}

/**
 * Format Unix timestamp to human-readable date/time
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
	const date = new Date(timestamp * 1000);
	return date.toLocaleString();
}

/**
 * Format Unix timestamp to relative time (e.g., "5 minutes ago")
 * @param timestamp - Unix timestamp in seconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
	const now = Date.now();
	const then = timestamp * 1000;
	const diffMs = now - then;
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSeconds < 60) {
		return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
	}
	if (diffMinutes < 60) {
		return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
	}
	if (diffHours < 24) {
		return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
	}
	return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

/**
 * Truncate a long address or hash
 * @param address - Full address or hash
 * @param startChars - Number of characters to show at start (default: 8)
 * @param endChars - Number of characters to show at end (default: 8)
 * @returns Truncated address with ellipsis
 */
export function truncateAddress(
	address: string,
	startChars = 8,
	endChars = 8,
): string {
	if (address.length <= startChars + endChars) {
		return address;
	}
	return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Parse transaction ID to extract block height, batch index, and tx index
 * @param txId - Transaction ID in format {block_height:016x}-{batch_index:04x}-{tx_index:04x}
 * @returns Object with parsed values
 */
export function parseTransactionId(txId: string): {
	blockHeight: number;
	batchIndex: number;
	txIndex: number;
} {
	const parts = txId.split("-");
	return {
		blockHeight: Number.parseInt(parts[0], 16),
		batchIndex: Number.parseInt(parts[1], 16),
		txIndex: Number.parseInt(parts[2], 16),
	};
}

/**
 * Format large numbers with suffixes (K, M, B)
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
	if (value >= 1_000_000_000) {
		return `${(value / 1_000_000_000).toFixed(2)}B`;
	}
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(2)}M`;
	}
	if (value >= 1_000) {
		return `${(value / 1_000).toFixed(2)}K`;
	}
	return value.toLocaleString();
}

/**
 * Get mint decimals based on known mints
 * @param mint - Solana mint address
 * @returns Number of decimals
 */
export function getMintDecimals(mint: string): number {
	// SOL
	if (mint === "So11111111111111111111111111111111111111112") {
		return 9;
	}
	// USDC
	if (mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") {
		return 6;
	}
	// Default to 9 decimals
	return 9;
}

