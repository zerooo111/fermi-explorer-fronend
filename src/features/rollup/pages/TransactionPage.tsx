import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Copy } from "lucide-react";
import { useTransaction } from "@/features/rollup/hooks/useApi";
import { PageSkeleton, TableSkeleton } from "@/shared/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";
import { buttonVariants } from "@/shared/components/ui/button";
import { formatPrice, formatQuantity } from "@/features/rollup/lib/formatters";

export default function TransactionPage() {
	const { id } = useParams({ from: "/execution/transactions/$id" });
	const { data: transaction, isLoading, error } = useTransaction(id);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	if (isLoading) {
		return (
			<PageSkeleton titleWidth="w-1/3">
				<TableSkeleton rows={5} />
			</PageSkeleton>
		);
	}

	if (error) {
		return (
			<div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
				<span className="text-base sm:text-2xl">Error loading transaction</span>
				<p className="text-sm sm:text-base text-zinc-400 text-center">
					{(error as Error).message || "Failed to load transaction data"}
				</p>
				<Link to="/execution" className={buttonVariants({ variant: "default" })}>
					Return to home
				</Link>
			</div>
		);
	}

	if (!transaction) {
		return (
			<div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
				<span className="text-base sm:text-2xl">Transaction not found</span>
				<Link to="/execution" className={buttonVariants({ variant: "default" })}>
					Return to home
				</Link>
			</div>
		);
	}

	return (
		<div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
			{/* Header */}
			<div className="mb-6 sm:mb-8">
				<Link
					to="/execution/blocks/$height"
					params={{ height: transaction.block_height.toString() }}
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-4 group"
				>
					<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
					Back to Block
				</Link>
				<h1 className="text-lg sm:text-xl font-bold mb-2">Transaction Details</h1>
				<p className="text-sm sm:text-base text-zinc-400 font-mono">
					Transaction ID: {transaction.id}
				</p>
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px border border-zinc-700 mb-6">
				<div className="bg-zinc-900 p-3 sm:p-4 pb-0">
					<div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
						BLOCK HEIGHT
					</div>
					<Link
						to="/execution/blocks/$height"
						params={{ height: transaction.block_height.toString() }}
						className="text-xl sm:text-3xl font-bold font-mono tabular-nums text-zinc-300 hover:text-zinc-100 hover:underline"
					>
						{transaction.block_height.toLocaleString()}
					</Link>
				</div>
				<div className="bg-zinc-900 p-3 sm:p-4 pb-0">
					<div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
						TYPE
					</div>
					<div className="text-xl sm:text-3xl font-bold font-mono capitalize text-zinc-100">
						{transaction.kind}
					</div>
				</div>
				<div className="bg-zinc-900 p-3 sm:p-4 pb-0">
					<div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
						SIDE
					</div>
					<div className="text-xl sm:text-3xl font-bold font-mono text-zinc-100">{transaction.side}</div>
				</div>
				<div className="bg-zinc-900 p-3 sm:p-4 pb-0">
					<div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
						BATCH INDEX
					</div>
					<div className="text-xl sm:text-3xl font-bold font-mono tabular-nums text-zinc-100">
						{transaction.batch_index}
					</div>
				</div>
			</div>

			{/* Transaction Details */}
			<div className="space-y-6">
				{/* Transaction ID */}
				<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50">
					<h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
						Transaction ID
					</h2>
					<div className="flex items-start justify-between gap-4">
						<p className="font-mono text-xs sm:text-sm break-all flex-1 text-zinc-100">
							{transaction.id}
						</p>
						<button
							type="button"
							onClick={() => copyToClipboard(transaction.id)}
							className="p-2 hover:bg-zinc-800 transition-colors flex-shrink-0 border border-zinc-700 rounded"
							aria-label="Copy transaction ID"
						>
							<Copy className="h-4 w-4 text-zinc-400" />
						</button>
					</div>
				</div>

				{/* Signature */}
				<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50">
					<h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
						Signature
					</h2>
					<div className="flex items-start justify-between gap-4">
						<p className="font-mono text-xs sm:text-sm break-all flex-1 text-zinc-100">
							{transaction.signature}
						</p>
						<button
							type="button"
							onClick={() => copyToClipboard(transaction.signature)}
							className="p-2 hover:bg-zinc-800 transition-colors flex-shrink-0 border border-zinc-700 rounded"
							aria-label="Copy signature"
						>
							<Copy className="h-4 w-4 text-zinc-400" />
						</button>
					</div>
				</div>

				{/* Order Details */}
				{transaction.kind === "order" && (
					<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50">
						<h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4">
							Order Details
						</h2>
						<div className="mobile-scroll-table">
							<Table className="w-full">
								<TableBody>
									<TableRow>
										<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
											Order ID
										</TableCell>
										<TableCell className="text-xs sm:text-sm font-mono text-zinc-100">
											{transaction.order_id}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
											Market
										</TableCell>
										<TableCell className="text-xs sm:text-sm font-mono text-zinc-100">
											{transaction.market_name || "N/A"}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
											Price
										</TableCell>
										<TableCell className="text-xs sm:text-sm font-mono font-semibold text-zinc-100">
											{formatPrice(transaction.price)}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
											Quantity
										</TableCell>
										<TableCell className="text-xs sm:text-sm font-mono font-semibold text-zinc-100">
											{formatQuantity(transaction.quantity)}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
											Base Mint
										</TableCell>
										<TableCell className="text-xs sm:text-sm font-mono break-all text-zinc-100 py-2 sm:py-3">
											{transaction.base_mint}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
											Quote Mint
										</TableCell>
										<TableCell className="text-xs sm:text-sm font-mono break-all text-zinc-100 py-2 sm:py-3">
											{transaction.quote_mint}
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					</div>
				)}

				{/* Owner */}
				<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50">
					<h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
						Owner
					</h2>
					<div className="flex items-start justify-between gap-4">
						<p className="font-mono text-xs sm:text-sm break-all flex-1 text-zinc-100">
							{transaction.owner}
						</p>
						<button
							type="button"
							onClick={() => copyToClipboard(transaction.owner)}
							className="p-2 hover:bg-zinc-800 transition-colors flex-shrink-0 border border-zinc-700 rounded"
							aria-label="Copy owner address"
						>
							<Copy className="h-4 w-4 text-zinc-400" />
						</button>
					</div>
				</div>

				{/* Additional Info */}
				<div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50">
					<h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4">
						Additional Information
					</h2>
					<div className="mobile-scroll-table">
						<Table className="w-full">
							<TableBody>
								<TableRow>
									<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
										Continuum Sequence
									</TableCell>
									<TableCell className="text-xs sm:text-sm font-mono text-zinc-100">
										{transaction.continuum_sequence}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
										Timestamp
									</TableCell>
									<TableCell className="text-xs sm:text-sm font-mono text-zinc-100">
										{new Date(transaction.timestamp_ms).toLocaleString()}
									</TableCell>
								</TableRow>
								{transaction.market_id && (
									<TableRow>
										<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
											Market ID
										</TableCell>
										<TableCell className="text-xs sm:text-sm font-mono break-all text-zinc-100 py-2 sm:py-3">
											{transaction.market_id}
										</TableCell>
									</TableRow>
								)}
								{transaction.market_kind && (
									<TableRow>
										<TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
											Market Kind
										</TableCell>
										<TableCell className="text-xs sm:text-sm font-mono capitalize text-zinc-100">
											{transaction.market_kind}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>
		</div>
	);
}
