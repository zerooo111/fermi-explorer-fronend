import React from "react";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TransactionsTable } from "@/components/TransactionsTable";
import type { DetailedTickData } from "@fermi/shared-types/api";

interface TickDetailViewProps {
  tickData: DetailedTickData;
}

export function TickDetailView({ tickData }: TickDetailViewProps) {
  return (
    <div className="space-y-8">
      {/* Tick Information */}
      <div className="mobile-scroll-table">
        <Table className="w-full">
          <TableBody>
            {/* Tick Number */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Tick Number
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.tick_number}
              </TableCell>
            </TableRow>

            {/* Timestamp */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Timestamp (μs)
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.timestamp_us}
              </TableCell>
            </TableRow>

            {/* Transaction Count */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Transaction Count
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.transaction_count}
              </TableCell>
            </TableRow>

            {/* Transaction Batch Hash */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Transaction Batch Hash
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono break-all">
                {tickData.transaction_batch_hash}
              </TableCell>
            </TableRow>

            {/* VDF Iterations */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                VDF Iterations
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.vdf_iterations}
              </TableCell>
            </TableRow>

            {/* VDF Input */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                VDF Input
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono break-all">
                {tickData.vdf_input}
              </TableCell>
            </TableRow>

            {/* VDF Output */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                VDF Output
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono break-all">
                {tickData.vdf_output}
              </TableCell>
            </TableRow>

            {/* VDF Proof */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                VDF Proof
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono break-all">
                {tickData.vdf_proof}
              </TableCell>
            </TableRow>

            {/* Previous Output */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Previous Output
              </TableCell>
              <TableCell className="text-xs  sm:text-sm font-mono break-all">
                {tickData.previous_output}
              </TableCell>
            </TableRow>

            {/* Processed At */}
            <TableRow>
              <TableCell className="text-xs py-2 whitespace-nowrap bg-neutral-900/50 sm:text-sm font-mono">
                Processed At
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.processed_at}
              </TableCell>
            </TableRow>

            {/* Ingestion Timestamp */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Ingestion Timestamp
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.ingestion_ts}
              </TableCell>
            </TableRow>

            {/* Version */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Version
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.version}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Transactions Table */}
      {tickData.transactions && tickData.transactions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Transactions in this Tick</h2>
          <TransactionsTable transactions={tickData.transactions} />
        </div>
      )}
    </div>
  );
}
