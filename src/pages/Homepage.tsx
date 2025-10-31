import { RecentTicks } from "@/components/RecentTicks";
import { RecentTransactions } from "@/components/RecentTransactions";
import { ChainStatus } from "@/components/ChainStatus";

export default function Homepage() {
  return (
    <div className="space-y-6 sm:space-y-8 container mx-auto max-w-screen-xl px-0 sm:px-6">
      <ChainStatus />
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-4 lg:gap-6">
        <RecentTicks limit={10} />
        <RecentTransactions limit={10} />
      </div>
    </div>
  );
}
