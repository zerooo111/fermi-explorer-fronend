import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import type { StatusResponse } from "@fermi/shared-types/api";
import { toBN, toSafeNumber } from "@fermi/shared-utils/big-numbers";
import { useEffect, useRef, useState } from "react";

const REFETCH_INTERVAL = 500;
const TREND_DIRECTION = 1;

const MetricCard = ({
  title,
  value,
  trend,
}: {
  title: string;
  value: number;
  trend: number;
}) => {
  return (
    <div className="bg-zinc-900 p-3 sm:p-4 pb-0 flex-1 min-w-0">
      <div className="text-xs sm:text-sm font-medium text-zinc-400 font-mono tracking-wider truncate">
        {title}
      </div>
      <div className="text-xl sm:text-3xl font-bold text-zinc-100 font-mono">
        <NumberFlow value={value} trend={trend} />
      </div>
    </div>
  );
};

export function ChainStatus() {
  const [tps, setTps] = useState(0);
  const previousTickRef = useRef<{ tick: number; timestamp: number } | null>(
    null
  );

  const { data: metrics } = useQuery({
    queryKey: ["chain-status"],
    queryFn: async () => {
      const res = (await fetch("api/v1/status").then((r) =>
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

  useEffect(() => {
    if (metrics?.current_tick) {
      const currentTick = toSafeNumber(toBN(metrics.current_tick));
      const currentTimestamp = Date.now();

      if (previousTickRef.current) {
        const tickDiff = currentTick - previousTickRef.current.tick;
        const timeDiff =
          (currentTimestamp - previousTickRef.current.timestamp) / 1000; // Convert to seconds

        if (timeDiff > 0 && tickDiff >= 0) {
          const calculatedTps = tickDiff / timeDiff;
          setTps(Math.round(calculatedTps * 10) / 10); // Round to 1 decimal place
        }
      }

      previousTickRef.current = {
        tick: currentTick,
        timestamp: currentTimestamp,
      };
    }
  }, [metrics?.current_tick]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-zinc-700 border border-zinc-700 overflow-hidden">
      <MetricCard
        title="CHAIN HEIGHT"
        value={toSafeNumber(toBN(metrics?.current_tick ?? "0"))}
        trend={TREND_DIRECTION}
      />

      <MetricCard
        title="TOTAL TXS"
        value={toSafeNumber(toBN(metrics?.total_transactions ?? "0"))}
        trend={TREND_DIRECTION}
      />

      <MetricCard
        title="TXS/SEC"
        value={Math.round(metrics?.transactions_per_second ?? 0)}
        trend={TREND_DIRECTION}
      />

      <MetricCard title="TICKS/SEC" value={tps} trend={TREND_DIRECTION} />
    </div>
  );
}

export default ChainStatus;
