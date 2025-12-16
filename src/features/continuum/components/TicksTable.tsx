import React from "react";
import { differenceInMilliseconds } from "date-fns";
import { Link } from "@tanstack/react-router";
import type { Tick, TickSummary } from "@/shared/types/shared/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  calculateAgeInMilliseconds,
  toBN,
  toSafeNumber,
} from "@/shared/utils/shared/big-numbers";

interface TicksTableProps {
  ticks: Array<Tick | TickSummary>;
  className?: string;
}

export function TicksTable({ ticks }: TicksTableProps) {
  const TickRow = React.memo(
    ({ tick }: { tick: Tick | TickSummary }) => {
      let millisecondsAgo: number;

      try {
        // Use bn.js for safe timestamp handling - timestamps are in microseconds
        millisecondsAgo = calculateAgeInMilliseconds(tick.timestamp);
      } catch (error) {
        console.warn("Error calculating age with big numbers:", error);
        // Fallback to original calculation
        const tickDate = new Date(tick.timestamp / 1000);
        millisecondsAgo = differenceInMilliseconds(new Date(), tickDate);
      }

      return (
        <TableRow key={tick.tick_number} className="h-10">
          <TableCell className="font-mono font-medium text-zinc-300 tabular-nums text-xs sm:text-sm text-left min-w-[80px] sm:min-w-32">
            <Link
              to="/sequencing/tick/$tickId"
              params={{ tickId: tick.tick_number.toString() }}
              className="hover:underline underline-offset-2 hover:text-zinc-100"
            >
              {toSafeNumber(toBN(tick.tick_number))}
            </Link>
          </TableCell>
          <TableCell className="text-zinc-400 text-xs sm:text-sm text-left font-mono">
            <div className="sm:hidden">
              {toSafeNumber(toBN(tick.transaction_count))} txs
            </div>
            <div className="hidden sm:block">
              {toSafeNumber(toBN(tick.transaction_count))} txns
            </div>
          </TableCell>

          <TableCell className="text-zinc-600 font-mono text-xs sm:text-sm text-right min-w-[90px] sm:min-w-36 whitespace-nowrap">
            <span className="sm:hidden">
              {Math.round(millisecondsAgo / 1000)}s ago
            </span>
            <span className="hidden sm:inline">{millisecondsAgo} ms ago</span>
          </TableCell>
        </TableRow>
      );
    },
    (prevProps, nextProps) =>
      prevProps.tick.tick_number === nextProps.tick.tick_number
  );

  if (ticks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs sm:text-sm text-zinc-500 font-mono tracking-wide">
          NO TICKS AVAILABLE
        </p>
      </div>
    );
  }

  const tableContent = (
    <div className="mobile-scroll-table w-full overflow-x-auto">
      <Table className="w-full min-w-[280px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Tick #</TableHead>
            <TableHead className="whitespace-nowrap">Tx Count</TableHead>
            <TableHead className="min-w-[90px] sm:min-w-36 text-right">
              Timestamp
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ticks.map((tick) => (
            <TickRow key={tick.tick_number} tick={tick} />
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return tableContent;
}
