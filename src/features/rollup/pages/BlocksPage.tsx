import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useBlocks } from "@/features/rollup/hooks/useApi";
import { Pagination } from "@/features/rollup/components/Pagination";
import { PageSkeleton, TableSkeleton } from "@/shared/components/ui/skeleton";
import { ErrorMessage } from "@/features/rollup/components/ErrorMessage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import {
	formatRelativeTime,
	formatTimestamp,
	truncateAddress,
} from "@/features/rollup/lib/formatters";

export default function BlocksPage() {
	const [page, setPage] = useState(0);
	const limit = 20;

	const { data, isLoading, error } = useBlocks(limit, page * limit);

	if (isLoading) {
		return (
			<PageSkeleton titleWidth="w-1/4">
				<TableSkeleton rows={20} />
			</PageSkeleton>
		);
	}

	if (error) {
		return (
			<div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
				<span className="text-base sm:text-2xl">Error loading blocks</span>
				<p className="text-sm sm:text-base text-zinc-400 text-center">
					{(error as Error).message || "Failed to load blocks"}
				</p>
				<Link to="/rollup" className="text-sm font-mono text-zinc-400 hover:text-zinc-100">
					Return to home
				</Link>
			</div>
		);
	}

	const totalPages = data ? Math.ceil(data.total / limit) : 0;

	return (
		<div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
			<div className="mb-6 sm:mb-8">
				<Link
					to="/rollup"
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-4 group"
				>
					<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
					Back to Dashboard
				</Link>
				<h1 className="text-lg sm:text-xl font-bold mb-2">All Blocks</h1>
				<p className="text-sm sm:text-base text-zinc-400">
					Browse all blocks on the Fermi rollup
				</p>
			</div>

			{data?.blocks && data.blocks.length > 0 ? (
				<>
					<div className="mobile-scroll-table mb-8">
						<Table className="w-full">
							<TableHeader>
								<TableRow>
									<TableHead>Block</TableHead>
									<TableHead>Time</TableHead>
									<TableHead>Txs</TableHead>
									<TableHead>Orders</TableHead>
									<TableHead>Cancels</TableHead>
									<TableHead className="text-right">State Root</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.blocks.map((block) => {
									const stateRootHex = block.state_root
										.map((b) => b.toString(16).padStart(2, "0"))
										.join("");
									return (
										<TableRow key={block.height}>
											<TableCell className="py-2 sm:py-3">
												<Link
													to="/rollup/blocks/$height"
													params={{ height: block.height.toString() }}
													className="font-mono font-bold text-sm sm:text-base text-zinc-300 hover:text-zinc-100 hover:underline inline-flex items-center gap-2 group/link"
												>
													#{block.height.toLocaleString()}
													<ArrowRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
												</Link>
											</TableCell>
											<TableCell className="py-2 sm:py-3">
												<div className="space-y-1">
													<p className="text-xs sm:text-sm font-mono text-zinc-100">
														{formatTimestamp(block.produced_at)}
													</p>
													<p className="text-xs text-zinc-400 font-mono">
														{formatRelativeTime(block.produced_at)}
													</p>
												</div>
											</TableCell>
											<TableCell className="py-2 sm:py-3">
												<span className="font-mono text-sm font-semibold tabular-nums text-zinc-300">
													{block.transaction_ids.length}
												</span>
											</TableCell>
											<TableCell className="py-2 sm:py-3">
												<span className="font-mono text-sm font-semibold tabular-nums text-zinc-300">
													{block.total_orders}
												</span>
											</TableCell>
											<TableCell className="py-2 sm:py-3">
												<span className="font-mono text-sm font-semibold tabular-nums text-zinc-300">
													{block.total_cancels}
												</span>
											</TableCell>
											<TableCell className="text-right py-2 sm:py-3">
												<span className="font-mono text-xs sm:text-sm text-zinc-400">
													{truncateAddress(stateRootHex, 8, 8)}
												</span>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			) : (
				<ErrorMessage message="No blocks found" />
			)}
		</div>
	);
}

