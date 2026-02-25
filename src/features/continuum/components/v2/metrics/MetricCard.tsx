import { memo, useState } from "react";
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
  sparklineData?: number[];
}

let sparklineIdCounter = 0;

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;

  const [gradientId] = useState(() => `sparkline-${++sparklineIdCounter}`);

  const w = 100;
  const h = 100;
  const rawMin = Math.min(...data);
  const rawMax = Math.max(...data);
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  // pad the range so small dips don't normalize to the floor
  const padding = Math.max(mean * 0.3, 1);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const range = max - min;
  const step = w / (data.length - 1);
  const maxH = h * 0.8;

  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * maxH]);
  // Build smooth cubic bezier curve through points
  let line = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev[0] + curr[0]) / 2;
    line += ` C${cpx},${prev[1]} ${cpx},${curr[1]} ${curr[0]},${curr[1]}`;
  }
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none text-border"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="40%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
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
  sparklineData,
}: MetricCardProps) {
  return (
    <div className={cn("relative flex flex-col gap-1 p-3 sm:p-4 overflow-hidden", className)}>
      {sparklineData && sparklineData.length >= 2 && (
        <Sparkline data={sparklineData} />
      )}
      <span className="relative inline-flex items-center gap-2 font-pixel text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">
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
        <span className="relative text-xl sm:text-4xl  text-foreground font-pixel tabular-nums">
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
