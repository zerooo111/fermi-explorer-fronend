import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionTableSkeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/api/queryKeys";
import { format } from "date-fns";
import NumberFlow from "@number-flow/react";
import { API_ROUTES } from "@/api/routes";

interface Transaction {
  tick_number: number;
  sequence_number: number;
  tx_hash: string;
  tx_id: string;
  nonce: number;
  payload: string;
  timestamp: number;
  signature: string;
  ingestion_timestamp: number;
  processed_at: string;
  payload_size: number;
  payload_type: string;
  version: number;
}

interface RecentTransactionsResponse {
  count: number;
  transactions: Transaction[];
}

interface RecentTransactionsProps {
  limit?: number;
}

export function RecentTransactions({ limit = 50 }: RecentTransactionsProps) {
  const { data, dataUpdatedAt, isLoading } = useQuery<RecentTransactionsResponse, Error>({
    queryKey: [...queryKeys.transactions.all(), 'recent', { limit }],
    queryFn: async () => {
      const response = await axios.get<RecentTransactionsResponse>(API_ROUTES.RECENT_TX(limit))
      return response.data
    },
    refetchInterval: 1000,
    staleTime: 0,
    gcTime: 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 flex-1">
        <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase px-4 sm:px-0">
          Recent Transactions
        </h3>
        <TransactionTableSkeleton rows={limit > 20 ? 20 : limit} />
        <div className="flex items-center justify-between px-4 sm:px-0">
          <span className="text-xs sm:text-sm text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex-1">
      <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase px-4 sm:px-0">
        Recent Transactions
      </h3>
      <TransactionsTable transactions={data?.transactions ?? []} />
      <div className="flex items-center justify-between px-4 sm:px-0">
        <span className="text-xs sm:text-sm text-zinc-400">Last updated</span>
        <span className="text-xs sm:text-sm text-zinc-400 font-mono font-medium">
          <span className="hidden sm:inline">{format(dataUpdatedAt, "MM/dd/yyyy")}</span>
          <NumberFlow value={Number(format(dataUpdatedAt, "HH"))} trend={1} />:
          <NumberFlow value={Number(format(dataUpdatedAt, "mm"))} trend={1} />:
          <NumberFlow value={Number(format(dataUpdatedAt, "ss"))} trend={1} />.
          <NumberFlow value={Number(format(dataUpdatedAt, "SSS"))} trend={1} />
        </span>
      </div>
    </div>
  );
}