import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { StatusResponse } from "@/shared/types/shared/api";
import { cn } from "@/shared/lib/utils";
import { continuumRoutes } from "@/shared/lib/routes";
import { AnimatedNumber } from "@/shared/components/ui/animated-number";

const REFETCH_INTERVAL = 500;

const MetricCard = ({
  title,
  value,
  className,
  showFractions = false,
}: {
  title: string;
  value: number;
  className?: string;
  showFractions?: boolean;
}) => {
  return (
    <div
      className={cn("bg-zinc-900 p-3 sm:p-4 pb-0 flex-1 min-w-0", className)}
    >
      <div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate">
        {title}
      </div>
      <div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
        <AnimatedNumber
          value={value}
          format={{
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }}
          duration={REFETCH_INTERVAL}
          trend={1}
          showFractions={showFractions}
        />
      </div>
    </div>
  );
};

export function ChainStatus() {
  const { data: metrics } = useQuery<StatusResponse>({
    queryKey: ["chain-status"],
    queryFn: async () => {
      const response = await axios.get<StatusResponse>(continuumRoutes.STATUS);
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });


  return (
    <div className="flex flex-col gap-4">
      <div className="grid-cols-2 grid divide-x divide-zinc-700 border border-zinc-700">
        <MetricCard
          title="CHAIN HEIGHT"
          value={metrics?.chain_height ?? 0}
        />

        <MetricCard
          title="TOTAL TXNs"
          value={metrics?.total_transactions ?? 0}
        />
      </div>

      <div className="grid-cols-3 grid divide-x divide-zinc-700 border border-zinc-700">
        <MetricCard
          title="TXNs PER SEC"
          value={Math.round(metrics?.txn_per_second ?? 0)}
        />

        <MetricCard
          title="TICKS PER SEC"
          value={Math.round(metrics?.ticks_per_second ?? 0)}
        />

        <MetricCard
          title="TICK TIME (μS)"
          value={metrics?.average_tick_time != null ? metrics.average_tick_time * 1000 : (metrics?.last_60_seconds?.mean_tick_time_micros ?? 0)}
          showFractions={true}
        />
      </div>
    </div>
  );
}

export default ChainStatus;
