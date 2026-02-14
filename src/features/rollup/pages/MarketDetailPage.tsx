import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Copy } from "lucide-react";
import { useMarkets, useEvents } from "@/features/rollup/hooks/useApi";
import { PageSkeleton, TableSkeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { truncateAddress } from "@/features/rollup/lib/formatters";

export default function MarketDetailPage() {
	const { marketId } = useParams({ from: "/execution/markets/$marketId" });
	const { data: marketsData, isLoading: marketsLoading } = useMarkets();
	const { data: eventsData, isLoading: eventsLoading } = useEvents(marketId, 20, 0);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	if (marketsLoading) {
		return (
			<PageSkeleton titleWidth="w-1/3">
				<TableSkeleton rows={6} />
			</PageSkeleton>
		);
	}

	const market = marketsData?.markets.find((m) => m.id === marketId);

	if (!market) {
		return (
			<div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
				<span className="text-base sm:text-2xl">Market not found</span>
				<Link to="/execution/markets" className="text-sm font-mono text-zinc-400 hover:text-zinc-100">
					Return to markets
				</Link>
			</div>
		);
	}

	return (
		<div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
			{/* Header */}
			<div className="mb-6 sm:mb-8">
				<Link
					to="/execution/markets"
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-4 group"
				>
					<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
					Back to Markets
				</Link>
				<div className="flex items-center gap-3 mb-2">
					<h1 className="text-lg sm:text-xl font-bold">{market.name}</h1>
					<Badge variant={market.kind === "Perp" ? "default" : "muted"}>
						{market.kind === "Perp" ? "Perpetual" : "Spot"}
					</Badge>
				</div>
			</div>

			{/* Market Info */}
			<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50 mb-6">
				<h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4">
					Market Information
				</h2>
				<div className="mobile-scroll-table">
					<Table className="w-full">
						<TableBody>
							<TableRow>
								<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono text-zinc-400 w-1/3">
									Market ID
								</TableCell>
								<TableCell className="text-xs sm:text-sm font-mono text-zinc-100 py-2 sm:py-3">
									<div className="flex items-center gap-2">
										<span className="break-all">{market.id}</span>
										<button
											type="button"
											onClick={() => copyToClipboard(market.id)}
											className="p-1 hover:bg-zinc-800 transition-colors flex-shrink-0 border border-zinc-700 rounded"
											aria-label="Copy market ID"
										>
											<Copy className="h-3 w-3 text-zinc-400" />
										</button>
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono text-zinc-400">
									Base Mint
								</TableCell>
								<TableCell className="text-xs sm:text-sm font-mono text-zinc-100 py-2 sm:py-3">
									<div className="flex items-center gap-2">
										<span className="break-all">{market.base_mint}</span>
										<button
											type="button"
											onClick={() => copyToClipboard(market.base_mint)}
											className="p-1 hover:bg-zinc-800 transition-colors flex-shrink-0 border border-zinc-700 rounded"
											aria-label="Copy base mint"
										>
											<Copy className="h-3 w-3 text-zinc-400" />
										</button>
									</div>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono text-zinc-400">
									Quote Mint
								</TableCell>
								<TableCell className="text-xs sm:text-sm font-mono text-zinc-100 py-2 sm:py-3">
									<div className="flex items-center gap-2">
										<span className="break-all">{market.quote_mint}</span>
										<button
											type="button"
											onClick={() => copyToClipboard(market.quote_mint)}
											className="p-1 hover:bg-zinc-800 transition-colors flex-shrink-0 border border-zinc-700 rounded"
											aria-label="Copy quote mint"
										>
											<Copy className="h-3 w-3 text-zinc-400" />
										</button>
									</div>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Perp Config */}
			{market.kind === "Perp" && market.perp_config && (
				<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50 mb-6">
					<h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4">
						Perpetual Configuration
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px border border-zinc-700">
						<div className="bg-zinc-900 p-3 sm:p-4">
							<div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
								Max Leverage
							</div>
							<div className="text-lg font-bold text-zinc-100 font-mono">
								{market.perp_config.max_leverage}x
							</div>
						</div>
						<div className="bg-zinc-900 p-3 sm:p-4">
							<div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
								Initial Margin
							</div>
							<div className="text-lg font-bold text-zinc-100 font-mono">
								{(market.perp_config.initial_margin_bps / 100).toFixed(2)}%
							</div>
						</div>
						<div className="bg-zinc-900 p-3 sm:p-4">
							<div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
								Maintenance Margin
							</div>
							<div className="text-lg font-bold text-zinc-100 font-mono">
								{(market.perp_config.maintenance_margin_bps / 100).toFixed(2)}%
							</div>
						</div>
						<div className="bg-zinc-900 p-3 sm:p-4">
							<div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
								Funding Interval
							</div>
							<div className="text-lg font-bold text-zinc-100 font-mono">
								{market.perp_config.funding_interval_seconds}s
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Recent Events */}
			<div>
				<h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4">
					Recent Events
				</h2>
				{eventsLoading ? (
					<TableSkeleton rows={5} />
				) : eventsData?.events && eventsData.events.length > 0 ? (
					<div className="mobile-scroll-table">
						<Table className="w-full">
							<TableHeader>
								<TableRow>
									<TableHead>Event ID</TableHead>
									<TableHead>Block</TableHead>
									<TableHead>Applied Orders</TableHead>
									<TableHead className="text-right">Batch Hash</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{eventsData.events.map((event) => (
									<TableRow key={event.id}>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-xs sm:text-sm text-zinc-300">
												{event.id}
											</span>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<Link
												to="/execution/blocks/$height"
												params={{ height: event.block_height.toString() }}
												className="font-mono text-sm text-zinc-300 hover:text-zinc-100 hover:underline inline-flex items-center gap-1 group/link"
											>
												#{event.block_height.toLocaleString()}
												<ArrowRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
											</Link>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-sm tabular-nums text-zinc-300">
												{event.applied_orders}
											</span>
										</TableCell>
										<TableCell className="text-right py-2 sm:py-3">
											<span className="font-mono text-xs sm:text-sm text-zinc-400">
												{truncateAddress(event.batch_hash, 8, 8)}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50">
						<p className="text-sm text-zinc-400 font-mono">No events found for this market.</p>
					</div>
				)}
			</div>
		</div>
	);
}
