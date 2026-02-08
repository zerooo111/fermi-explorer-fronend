import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { StatusResponse } from "@/shared/types/shared/api";
import { cn } from "@/shared/lib/utils";
import { continuumRoutes } from "@/shared/lib/routes";
import { AnimatedNumber, Card, CardContent, Stagger, StaggerItem } from "@/shared/components/ui";

const REFETCH_INTERVAL = 500;

const MetricCard = ({
  title,
  value,
  className,
  decimals = 2,
}: {
  title: string;
  value: number;
  className?: string;
  decimals?: number;
}) => {
  return (
    <Card variant="default" className={cn("flex-1 min-w-0 p-3 sm:p-4 pb-0 gap-0", className)}>
      <div className="text-xs sm:text-sm font-medium text-muted-foreground font-mono tracking-wider truncate">
        {title}
      </div>
      <CardContent className="p-0">
        <div className="text-xl sm:text-3xl font-bold text-foreground font-mono">
          <AnimatedNumber
            value={value}
            format="raw"
            decimals={decimals}
          />
        </div>
      </CardContent>
    </Card>
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
    <Stagger className="flex flex-col gap-4">
      <StaggerItem>
        <div className="grid-cols-2 grid divide-x divide-border border border-border gap-px bg-background">
          <MetricCard title="CHAIN HEIGHT" value={metrics?.chain_height ?? 0} />

          <MetricCard
            title="TOTAL TXNs"
            value={metrics?.total_transactions ?? 0}
          />
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="grid-cols-3 grid divide-x divide-border border border-border gap-px bg-background">
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
            value={
              metrics?.average_tick_time != null
                ? metrics.average_tick_time
                : metrics?.last_60_seconds?.mean_tick_time_micros ?? 0
            }
            decimals={1}
          />
        </div>
      </StaggerItem>
    </Stagger>
  );
}

export default ChainStatus;
