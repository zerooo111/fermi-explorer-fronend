import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";
import { ErrorMessage } from "@/features/rollup/components/ErrorMessage";
import { PageSkeleton, TableSkeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  useBlocks,
  useLatestBlock,
  useStatus,
} from "@/features/rollup/hooks/useApi";
import {
  formatRelativeTime,
  formatTimestamp,
  truncateAddress,
} from "@/features/rollup/lib/formatters";
import { cn } from "@/shared/lib/utils";

export default function RollupHomepage() {
  const { data: status, isLoading: statusLoading } = useStatus();
  const { data: blocksData, isLoading: blocksLoading } = useBlocks(10, 0);
  const { data: latestBlock, isLoading: latestBlockLoading } = useLatestBlock();

  if (statusLoading || blocksLoading || latestBlockLoading) {
    return (
      <PageSkeleton titleWidth="w-1/3">
        <TableSkeleton rows={10} />
      </PageSkeleton>
    );
  }

  const isLive = !statusLoading && !latestBlockLoading;

  return (
    <div className="space-y-6 sm:space-y-8 container mx-auto max-w-screen-xl px-0 sm:px-6">
      {/* Stats Grid */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 border border-zinc-700 divide-x divide-zinc-700">
          <div className="bg-zinc-900 p-3 sm:p-4 pb-0 flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate">
                LATEST BLOCK
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 border",
                    isLive
                      ? "bg-green-500 border-green-400"
                      : "bg-zinc-500 border-zinc-400"
                  )}
                />
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  {isLive ? "Live" : "..."}
                </span>
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
              <AnimatedNumber
                value={latestBlock?.block.height ?? status?.block_height ?? 0}
                format={{
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }}
                duration={500}
                trend={1}
              />
            </div>
          </div>

          <div className="bg-zinc-900 p-3 sm:p-4 pb-0 flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate mb-2">
              APPLIED BATCHES
            </div>
            <div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
              <AnimatedNumber
                value={status?.applied_batches ?? 0}
                format={{
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }}
                duration={500}
                trend={1}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Latest Blocks Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase">
            Latest Blocks
          </h2>
          <Link
            to="/execution/blocks"
            className="text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors uppercase tracking-wider inline-flex items-center gap-2 group"
          >
            View all
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {blocksData?.blocks && blocksData.blocks.length > 0 ? (
          <div className="mobile-scroll-table">
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
                {blocksData.blocks.slice(0, 10).map((block) => {
                  const stateRootHex = block.state_root
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
                  return (
                    <TableRow key={block.height}>
                      <TableCell className="py-2 sm:py-3">
                        <Link
                          to="/execution/blocks/$height"
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
        ) : (
          <div className="p-4 sm:p-6">
            <ErrorMessage message="No blocks found" />
          </div>
        )}
      </div>

      {/* State Root Display */}
      {status?.state_root && (
        <div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50">
          <h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
            Current State Root
          </h2>
          <p className="font-mono text-xs sm:text-sm break-all text-zinc-100">
            {status.state_root
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")}
          </p>
        </div>
      )}
    </div>
  );
}
