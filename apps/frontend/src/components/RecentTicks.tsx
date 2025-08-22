import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TicksTable } from "./TicksTable";
import type { RecentTicksResponse } from "@/api/types";
import { queryKeys } from "@/api/queryKeys";
import { format } from "date-fns";
import NumberFlow from "@number-flow/react";

interface RecentTicksProps {
  limit?: number;
  showAge?: boolean;
}

export function RecentTicks({ limit = 50 }: RecentTicksProps) {
  const { data, dataUpdatedAt } = useQuery<RecentTicksResponse, Error>({
    queryKey: queryKeys.ticks.recent({ limit }),
    queryFn: async () => {
      const response = await axios.get<RecentTicksResponse>(`/api/v1/ticks/recent?limit=${limit}`)
      return response.data
    },
    refetchInterval: 500,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase px-4 sm:px-0">
        Recent Ticks
      </h3>
      <TicksTable ticks={data?.ticks ?? []} />
      <div className="flex items-center justify-between px-4 sm:px-0">
        <span className="text-xs sm:text-sm text-zinc-400">Last updated</span>
        <span className="text-xs sm:text-sm text-zinc-400 font-mono font-medium">
          <span className="hidden sm:inline">{format(dataUpdatedAt, "MM/dd/yyyy")}</span>
          <NumberFlow value={Number(format(dataUpdatedAt, "HH"))} trend={1} />:
          <NumberFlow value={Number(format(dataUpdatedAt, "mm"))} trend={1} />:
          <NumberFlow value={Number(format(dataUpdatedAt, "ss"))} trend={1} />.
          <NumberFlow value={Number(format(dataUpdatedAt, "SSS"))} trend={1} />
        </span>
      </div>
    </div>
  );
}
