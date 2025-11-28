import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TicksTable } from "./TicksTable";
import type { RecentTicksResponse } from "@/features/continuum/api/types";
import { queryKeys } from "@/features/continuum/api/queryKeys";
import { continuumRoutes } from "@/shared/lib/routes";
import { LastUpdated } from "@/shared/components/LastUpdated";
import SectionHeading from "@/shared/components/SectionHeading";
import { TicksTableSkeleton } from "@/shared/components/ui/skeleton";

interface RecentTicksProps {
  limit?: number;
  showAge?: boolean;
}

export function RecentTicks({ limit = 50 }: RecentTicksProps) {
  const { data, dataUpdatedAt, isLoading } = useQuery<
    RecentTicksResponse,
    Error
  >({
    queryKey: queryKeys.ticks.recent({ limit }),
    queryFn: async () => {
      const response = await axios.get<RecentTicksResponse>(
        continuumRoutes.RECENT_TICKS(limit)
      );
      return response.data;
    },
    refetchInterval: 1000,
    staleTime: 0,
    gcTime: 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SectionHeading>Recent Ticks</SectionHeading>
        <TicksTableSkeleton rows={limit > 10 ? 10 : limit} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeading>Recent Ticks</SectionHeading>
      <TicksTable ticks={data?.ticks ?? []} />
      <LastUpdated timestamp={dataUpdatedAt} />
    </div>
  );
}
