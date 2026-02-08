import { TransactionsTable } from "./TransactionsTable";
import { TransactionTableSkeleton, Reveal } from "@/shared/components/ui";
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
        <TransactionTableSkeleton rows={limit > 10 ? 10 : limit} />
      </div>
    );
  }

  return (
    <Reveal direction="up">
      <div className="space-y-4">
        <SectionHeading>Recent Transactions</SectionHeading>
        <TransactionsTable transactions={data?.transactions ?? []} />
        <LastUpdated timestamp={dataUpdatedAt} className="px-4 sm:px-0" />
      </div>
    </Reveal>
  );
}
