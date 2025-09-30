import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import type { StatusResponse } from "../types/shared/api";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api";

const REFETCH_INTERVAL = 500;
const TREND_DIRECTION = 1;

const MetricCard = ({
  title,
  value,
  trend,
  className,
}: {
  title: string;
  value: number;
  trend: number;
  className?: string;
}) => {
  return (
    <div
      className={cn("bg-zinc-900 p-3 sm:p-4 pb-0 flex-1 min-w-0", className)}
    >
      <div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate">
        {title}
      </div>
      <div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
        <NumberFlow format={{ currency: "USD" }} value={value} trend={trend} />
      </div>
    </div>
  );
};

export function ChainStatus() {
  const { data: metrics } = useQuery({
    queryKey: ["chain-status"],
    queryFn: async () => {
      const res = (await fetch(getApiUrl("/api/v1/status")).then((r) =>
        r.json()
      )) as StatusResponse;
      return res;
    },
    staleTime: 0,
    gcTime: 0,
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

    const { data: chain_state } = useQuery({
    queryKey: ["chain-status-v2"],
    queryFn: async () => {
      const res = (await fetch(getApiUrl("/api/v1/chain-state")).then((r) =>
        r.json()
      )) as { current_tick: number, total_transactions: number};
      console.log({chain_state: res})
      return res;
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
          trend={TREND_DIRECTION}
        />

        <MetricCard
          title="TOTAL TXNs"
          value={chain_state?.total_transactions ?? 0}
          trend={TREND_DIRECTION}
        />
      </div>

      <div className="grid-cols-3 grid divide-x divide-zinc-700 border border-zinc-700">
        <MetricCard
          title="TXNs PER SEC"
          value={Math.round((metrics?.total_transactions ?? 0) / 60)}
          trend={TREND_DIRECTION}
        />

        <MetricCard
          title="TICKS PER SEC"
          value={Math.round((metrics?.last_60_seconds?.tick_count ?? 0) / 60)}
          trend={TREND_DIRECTION}
        />

        <MetricCard
          title="TICK TIME (MS)"
          value={(metrics?.last_60_seconds?.mean_tick_time_micros ?? 0) / 1000}
          trend={TREND_DIRECTION}
        />
      </div>
    </div>
  );
}

export default ChainStatus;
