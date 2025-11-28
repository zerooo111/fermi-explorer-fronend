import { TransactionsTable } from "./TransactionsTable";
import { TransactionTableSkeleton } from "@/shared/components/ui/skeleton";
import { LastUpdated } from "@/shared/components/LastUpdated";
import SectionHeading from "@/shared/components/SectionHeading";
import { useContinuumRecentTransactions } from "@/features/continuum/hooks/useTransaction";

interface RecentTransactionsProps {
  limit?: number;
}

export function RecentTransactions({ limit = 50 }: RecentTransactionsProps) {
  const { data, dataUpdatedAt, isLoading } = useContinuumRecentTransactions(limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SectionHeading>Recent Transactions</SectionHeading>
        <TransactionTableSkeleton rows={limit > 20 ? 20 : limit} />
        <div className="flex items-center justify-between px-4 sm:px-0">
          <span className="text-xs sm:text-sm text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeading>Recent Transactions</SectionHeading>
      <TransactionsTable transactions={data?.transactions ?? []} />
      <LastUpdated timestamp={dataUpdatedAt} className="px-4 sm:px-0" />
    </div>
  );
}
