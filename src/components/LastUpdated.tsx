import { format } from "date-fns";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

interface LastUpdatedProps {
  timestamp: number | Date;
  className?: string;
}

export function LastUpdated({ timestamp, className }: LastUpdatedProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-xs sm:text-sm text-zinc-400">Last updated</span>
      <span className="text-xs sm:text-sm text-zinc-400 font-mono font-medium">
        <span className="hidden sm:inline">{format(timestamp, "MM/dd/yyyy")}</span>
        <NumberFlow value={Number(format(timestamp, "HH"))} trend={1} />:
        <NumberFlow value={Number(format(timestamp, "mm"))} trend={1} />:
        <NumberFlow value={Number(format(timestamp, "ss"))} trend={1} />.
        <NumberFlow value={Number(format(timestamp, "SSS"))} trend={1} />
      </span>
    </div>
  );
}

