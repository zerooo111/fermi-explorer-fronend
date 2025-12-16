import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type TransactionsTableRow = {
  tx_hash: string;
  sequence_number: number;
  tick_number: number;
  tx_id: string;
  // Possible time fields from various endpoints
  timestamp?: number; // microseconds
  ingestion_timestamp?: number; // microseconds
  client_timestamp?: number; // microseconds
  created_at?: string; // ISO timestamp
};

interface TransactionsTableProps {
  transactions: TransactionsTableRow[];
  className?: string;
}

function formatTimestamp(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const TransactionRow = React.memo(
    ({ transaction }: { transaction: TransactionsTableRow }) => {
      // Prefer server creation time, then ingestion, then canonical timestamp, then client time
      const millisFromMicros = (value?: number) =>
        typeof value === "number" ? Math.floor(value / 1000) : undefined;

      const createdAtDate = transaction.created_at
        ? new Date(transaction.created_at)
        : undefined;
      const ingestionDateMs = millisFromMicros(transaction.ingestion_timestamp);
      const timestampDateMs = millisFromMicros(transaction.timestamp);
      const clientDateMs = millisFromMicros(transaction.client_timestamp);

      const referenceMs =
        (createdAtDate?.getTime?.() as number | undefined) ??
        ingestionDateMs ??
        timestampDateMs ??
        clientDateMs;

      const transactionDate =
        referenceMs !== undefined ? new Date(referenceMs) : new Date();
      const formattedTime = formatTimestamp(transactionDate);

      return (
        <TableRow key={transaction.tx_hash} className="h-10">
          <TableCell className="font-mono font-medium text-zinc-300 tabular-nums text-xs sm:text-sm text-left min-w-[60px] md:min-w-[80px]">
            <span className="hover:text-zinc-100" title={transaction.tx_hash}>
              {transaction.sequence_number}
            </span>
          </TableCell>
          <TableCell className="font-mono font-medium text-zinc-300 tabular-nums text-xs sm:text-sm text-left min-w-[100px] md:min-w-[140px]">
            <a
              href={`/sequencing/tx/${transaction.tx_hash.slice(0, 8)}`}
              target="_blank"
              className="hover:text-zinc-100 hover:underline truncate block"
              title={transaction.tx_hash}
            >
              <span className="md:hidden">{transaction.tx_hash.slice(0, 6)}...{transaction.tx_hash.slice(-6)}</span>
              <span className="hidden md:inline">{transaction.tx_hash.slice(0, 8)}...{transaction.tx_hash.slice(-8)}</span>
            </a>
          </TableCell>
          <TableCell className="text-zinc-400 text-xs sm:text-sm text-left font-mono min-w-[70px] md:min-w-[90px]">
            <a
              href={`/sequencing/tick/${transaction.tick_number}`}
              target="_blank"
              className="hover:text-zinc-100 hover:underline"
            >
              {transaction.tick_number}
            </a>
          </TableCell>
          <TableCell className="text-zinc-400 text-xs sm:text-sm text-left font-mono">
            <div className="truncate max-w-[80px] md:max-w-[120px] lg:max-w-[200px]">
              {transaction.tx_id}
            </div>
          </TableCell>
          <TableCell className="text-zinc-600 font-mono text-xs sm:text-sm text-right min-w-[70px] md:min-w-[90px] lg:min-w-[160px] whitespace-nowrap">
            {formattedTime}
          </TableCell>
        </TableRow>
      );
    },
    (prevProps, nextProps) =>
      prevProps.transaction.tx_hash === nextProps.transaction.tx_hash
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs sm:text-sm text-zinc-500 font-mono tracking-wide">
          NO TRANSACTIONS AVAILABLE
        </p>
      </div>
    );
  }

  const tableContent = (
    <div className="mobile-scroll-table overflow-x-auto">
      <Table className="w-full min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Sequence #</TableHead>
            <TableHead className="whitespace-nowrap">Txn Hash</TableHead>
            <TableHead className="whitespace-nowrap">Tick #</TableHead>
            <TableHead>Txn Id</TableHead>
            <TableHead className="min-w-[90px] sm:min-w-36 text-right">
              Timestamp
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.tx_hash}
              transaction={transaction}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return tableContent;
}
