// API Response Types for Fermi Rollup Explorer

export interface NodeStatus {
	block_height: number;
	state_root: number[];
	applied_batches: number;
}

export interface PerpConfig {
	max_leverage: number;
	initial_margin_bps: number;
	maintenance_margin_bps: number;
	funding_interval_seconds: number;
}

export interface Market {
	id: string; // UUID
	base_mint: string;
	quote_mint: string;
	name: string;
	kind: "Perp" | "Spot";
	perp_config?: PerpConfig;
}

export interface MarketsResponse {
	markets: Market[];
}

export interface BatchSummary {
	index: number;
	tick_number: number;
	order_count: number;
	cancel_count: number;
	continuum_sequences: number[];
	batch_hash: string;
}

export interface Block {
	height: number;
	state_root: number[];
	applied_batches: number;
	applied_orders: number;
	produced_at: number; // Unix seconds
	total_orders: number;
	total_cancels: number;
	batch_summaries: BatchSummary[];
	transaction_ids: string[];
	event_ids: string[];
}

export interface Order {
	order_id: string;
	market_id: string;
	market_name: string;
	owner: string;
	side: "Buy" | "Sell";
	price: string;
	quantity: string;
	base_mint: string;
	quote_mint: string;
}

export interface Cancel {
	order_id: string;
	market_id: string;
	market_name: string;
	owner: string;
}

export interface Transaction {
	id: string; // format: {block_height:016x}-{batch_index:04x}-{tx_index:04x}
	block_height: number;
	batch_index: number;
	kind: string; // "order" | "cancel"
	market_id: string | null;
	market_name: string | null;
	market_kind: string;
	owner: string;
	side: string;
	price: number;
	quantity: number;
	base_mint: string;
	quote_mint: string;
	order_id: number;
	timestamp_ms: number;
	continuum_sequence: number;
	signature: string;
}

export interface Event {
	id: string;
	block_height: number;
	batch_index: number;
	event_index: number;
	market_id: string;
	applied_orders: number;
	batch_hash: string;
}

export interface BlockWithDetails {
	block: Block;
	transactions: Transaction[];
	events: Event[];
}

export interface BlocksListResponse {
	blocks: Block[];
	total: number;
	limit: number;
	offset: number;
}

export interface EventsResponse {
	events: Event[];
	total: number;
	limit: number;
	offset: number;
}

export interface WebSocketMessage {
	type: "new_block";
	block: Block;
}

