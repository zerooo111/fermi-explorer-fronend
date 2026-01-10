// import { RecentTicks } from "@/features/continuum/components/RecentTicks";
import { RecentTransactions } from "@/features/continuum/components/RecentTransactions";
import { ChainStatus } from "@/features/continuum/components/ChainStatus";

export default function Homepage() {
  return (
    <div className="space-y-6 sm:space-y-8 container mx-auto max-w-screen-xl px-0 sm:px-6">
      <ChainStatus />
      <div>
        {/* <RecentTicks limit={10} /> */}
        <RecentTransactions limit={10} />
      </div>
    </div>
  );
}
