import React from "react";
import { differenceInMilliseconds } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TransactionData } from "../types/shared/api";

interface TransactionsTableProps {
  transactions: TransactionData[];
  className?: string;
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const TransactionRow = React.memo(
    ({ transaction }: { transaction: TransactionData }) => {
      const transactionDate = new Date(transaction.timestamp / 1000);
      const millisecondsAgo = differenceInMilliseconds(
        new Date(),
        transactionDate
      );

      return (
        <TableRow key={transaction.tx_hash} className="h-10">
          <TableCell className="font-mono font-medium text-zinc-300 tabular-nums text-xs sm:text-sm text-left">
            <span className="hover:text-zinc-100" title={transaction.tx_hash}>
              {transaction.sequence_number}
            </span>
          </TableCell>
          <TableCell className="font-mono font-medium text-zinc-300 tabular-nums text-xs sm:text-sm text-left ">
            <a
              href={`/tx/${transaction.tx_hash.slice(0, 8)}`}
              target="_blank"
              className="hover:text-zinc-100 hover:underline"
              title={transaction.tx_hash}
            >
              {transaction.tx_hash.slice(0, 8)}...
              {transaction.tx_hash.slice(-8)}
            </a>
          </TableCell>
          <TableCell className="text-zinc-400 text-xs sm:text-sm text-left font-mono">
            <a
              href={`/tick/${transaction.tick_number}`}
              target="_blank"
              className="sm:block hover:text-zinc-100 hover:underline"
            >
              {transaction.tick_number}
            </a>
          </TableCell>
          <TableCell className="text-zinc-400 text-xs sm:text-sm text-left font-mono">
            <div className="truncate max-w-[120px] sm:max-w-[200px]">
              {transaction.tx_id}
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
    <div className="mobile-scroll-table">
      <Table className="w-full">
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
