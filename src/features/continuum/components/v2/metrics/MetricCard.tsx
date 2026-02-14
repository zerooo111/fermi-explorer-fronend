import { memo } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/utils";
import { AnimatedNumber, Skeleton } from "@/shared/components/ui";
import type { FormatType } from "@/shared/components/ui";

interface MetricCardProps {
  label: string;
  value: number | undefined;
  icon?: Icon;
  format?: FormatType;
  decimals?: number;
  suffix?: string;
  isLoading?: boolean;
  className?: string;
}

export const MetricCard = memo(function MetricCard({
  label,
  value,
  icon: IconComponent,
  format = "raw",
  decimals = 0,
  suffix,
  isLoading,
  className,
}: MetricCardProps) {
  return (
    <div className={cn("flex flex-col gap-1 p-3 sm:p-4", className)}>
      <span className="inline-flex items-center gap-2 font-pixel text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">
        {IconComponent && (
          <IconComponent
            weight="duotone"
            className="w-4 h-4 text-muted-foreground/70 shrink-0"
          />
        )}
        {label}
      </span>
      {isLoading ? (
        <Skeleton className="h-7 sm:h-9 w-24" />
      ) : (
        <span className="text-xl sm:text-4xl  text-foreground font-pixel tabular-nums">
          <AnimatedNumber
            value={value ?? 0}
            format={format}
            decimals={decimals}
          />
          {suffix && (
            <span className="text-sm text-muted-foreground ml-1">{suffix}</span>
          )}
        </span>
      )}
    </div>
  );
});
