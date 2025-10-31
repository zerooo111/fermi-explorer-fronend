import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TicksTable } from "./TicksTable";
import type { RecentTicksResponse } from "@/api/types";
import { queryKeys } from "@/api/queryKeys";
import { API_ROUTES } from "@/api/routes";
import { LastUpdated } from "./LastUpdated";
import SectionHeading from "./SectionHeading";

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
        API_ROUTES.RECENT_TICKS(limit)
      );
      return response.data;
    },
    refetchInterval: 1000,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <div className="space-y-4">
      <SectionHeading>Recent Ticks</SectionHeading>
      {isLoading ? (
        <div className="flex items-center justify-between ">
          <span className="text-xs sm:text-sm text-zinc-400">Loading...</span>
        </div>
      ) : (
        <>
          <TicksTable ticks={data?.ticks ?? []} />
          <LastUpdated timestamp={dataUpdatedAt} />
        </>
      )}
    </div>
  );
}
