import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Copy } from "lucide-react";
import { useBlock } from "@/features/rollup/hooks/useApi";
import { PageSkeleton, TableSkeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { buttonVariants } from "@/shared/components/ui/button";
import {
	formatNumber,
	formatRelativeTime,
	formatTimestamp,
} from "@/features/rollup/lib/formatters";

export default function BlockDetailPage() {
	const { height } = useParams({ from: "/execution/blocks/$height" });
	const blockHeight = Number.parseInt(height, 10);
	const { data, isLoading, error } = useBlock(blockHeight);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	if (isLoading) {
		return (
			<PageSkeleton titleWidth="w-1/4">
				<TableSkeleton rows={10} />
			</PageSkeleton>
		);
	}

	if (error) {
		return (
			<div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
				<span className="text-base sm:text-2xl">Error loading block</span>
				<p className="text-sm sm:text-base text-zinc-400 text-center">
					{(error as Error).message || "Failed to load block data"}
				</p>
				<Link to="/execution/blocks" className={buttonVariants({ variant: "default" })}>
					Return to blocks
				</Link>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
				<span className="text-base sm:text-2xl">Block not found</span>
				<Link to="/execution/blocks" className={buttonVariants({ variant: "default" })}>
					Return to blocks
				</Link>
			</div>
		);
	}

	const stateRootHex = data.block.state_root
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return (
		<div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
			{/* Header */}
			<div className="mb-6 sm:mb-8">
				<Link
					to="/execution/blocks"
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-4 group"
				>
					<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
					Back to Blocks
				</Link>
				<h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
					Block #{data.block.height.toLocaleString()}
				</h1>
				<div className="space-y-1">
					<p className="text-xs sm:text-sm font-mono text-zinc-100">
						{formatTimestamp(data.block.produced_at)}
					</p>
					<p className="text-xs text-zinc-400 font-mono">
						{formatRelativeTime(data.block.produced_at)}
					</p>
				</div>
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px border border-zinc-700 mb-6">
				<div className="bg-zinc-900 p-3 sm:p-4 pb-0">
					<div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
						TRANSACTIONS
					</div>
					<div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
						{data.block.transaction_ids.length}
					</div>
				</div>
				<div className="bg-zinc-900 p-3 sm:p-4 pb-0">
					<div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
						ORDERS
					</div>
					<div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
						{data.block.total_orders}
					</div>
				</div>
				<div className="bg-zinc-900 p-3 sm:p-4 pb-0">
					<div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
						CANCELS
					</div>
					<div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
						{data.block.total_cancels}
					</div>
				</div>
				<div className="bg-zinc-900 p-3 sm:p-4 pb-0">
					<div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
						BATCHES
					</div>
					<div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
						{data.block.batch_summaries.length}
					</div>
				</div>
			</div>

			{/* State Root */}
			<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50 mb-6">
				<h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
					State Root
				</h2>
				<div className="flex items-start justify-between gap-4">
					<p className="font-mono text-zinc-100 text-xs sm:text-sm break-all flex-1">
						{stateRootHex}
					</p>
					<button
						type="button"
						onClick={() => copyToClipboard(stateRootHex)}
						className="p-2 hover:bg-zinc-800 transition-colors flex-shrink-0 border border-zinc-700 rounded"
						aria-label="Copy state root"
					>
						<Copy className="h-4 w-4 text-zinc-400" />
					</button>
				</div>
			</div>

			{/* Batch Summaries */}
			{data.block.batch_summaries.length > 0 && (
				<div className="mb-6">
					<h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4">
						Batch Summaries ({data.block.batch_summaries.length})
					</h2>
					<div className="mobile-scroll-table">
						<Table className="w-full">
							<TableHeader>
								<TableRow>
									<TableHead>Batch</TableHead>
									<TableHead>Tick Number</TableHead>
									<TableHead>Orders</TableHead>
									<TableHead>Cancels</TableHead>
									<TableHead>Batch Hash</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.block.batch_summaries.map((batch) => (
									<TableRow key={batch.index}>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono font-bold text-sm text-zinc-300">
												#{batch.index}
											</span>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-sm tabular-nums text-zinc-300">
												{formatNumber(batch.tick_number)}
											</span>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-sm font-semibold tabular-nums text-zinc-300">
												{batch.order_count}
											</span>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-sm font-semibold tabular-nums text-zinc-300">
												{batch.cancel_count}
											</span>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<div className="flex items-center gap-2">
												<span className="font-mono text-xs sm:text-sm text-zinc-400">
													{batch.batch_hash.substring(0, 8)}...{batch.batch_hash.substring(batch.batch_hash.length - 8)}
												</span>
												<button
													type="button"
													onClick={() => copyToClipboard(batch.batch_hash)}
													className="p-1 hover:bg-zinc-800 transition-colors flex-shrink-0 border border-zinc-700 rounded"
													aria-label="Copy batch hash"
												>
													<Copy className="h-3 w-3 text-zinc-400" />
												</button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}

			{/* Transactions */}
			{data.transactions.length > 0 && (
				<div className="mb-6">
					<h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4">
						Transactions ({data.transactions.length})
					</h2>
					<div className="mobile-scroll-table">
						<Table className="w-full">
							<TableHeader>
								<TableRow>
									<TableHead>Transaction ID</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Side</TableHead>
									<TableHead className="text-right">Owner</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.transactions.map((tx) => (
									<TableRow key={tx.id}>
										<TableCell className="py-2 sm:py-3">
											<Link
												to="/execution/transactions/$id"
												params={{ id: tx.id }}
												className="font-mono text-xs sm:text-sm text-zinc-300 hover:text-zinc-100 hover:underline inline-flex items-center gap-2 group/link"
											>
												{tx.id}
												<ArrowRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
											</Link>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-sm capitalize text-zinc-300">
												{tx.kind}
											</span>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-sm text-zinc-300">{tx.side}</span>
										</TableCell>
										<TableCell className="text-right py-2 sm:py-3">
											<span className="font-mono text-xs sm:text-sm text-zinc-400">
												{tx.owner.substring(0, 8)}...
												{tx.owner.substring(tx.owner.length - 8)}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}

			{/* Events */}
			{data.events.length > 0 && (
				<div>
					<h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4">
						Events ({data.events.length})
					</h2>
					<div className="mobile-scroll-table">
						<Table className="w-full">
							<TableHeader>
								<TableRow>
									<TableHead>Event ID</TableHead>
									<TableHead>Market ID</TableHead>
									<TableHead>Applied Orders</TableHead>
									<TableHead className="text-right">Batch Hash</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.events.map((event) => (
									<TableRow key={event.id}>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-xs sm:text-sm text-zinc-300">{event.id}</span>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-xs sm:text-sm text-zinc-400">
												{event.market_id.substring(0, 8)}...
											</span>
										</TableCell>
										<TableCell className="py-2 sm:py-3">
											<span className="font-mono text-sm tabular-nums text-zinc-300">
												{event.applied_orders}
											</span>
										</TableCell>
										<TableCell className="text-right py-2 sm:py-3">
											<span className="font-mono text-xs sm:text-sm text-zinc-400">
												{event.batch_hash.substring(0, 12)}...
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}
		</div>
	);
}
