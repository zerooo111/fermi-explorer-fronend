import { memo, useState, useRef, useEffect } from "react";
import type { Icon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/components/ui";
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

const DIGITS = '0123456789'

function SlotDigit({ char, index }: { char: string; index: number }) {
  const prevChar = useRef(char)
  const [displayed, setDisplayed] = useState(char)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const renderKey = useRef(0)

  useEffect(() => {
    if (prevChar.current === char) return
    prevChar.current = char

    const isDigit = DIGITS.includes(char)
    if (!isDigit) {
      setDisplayed(char)
      return
    }

    const totalSteps = 6 + Math.floor(Math.random() * 4)
    let step = 0
    const baseDelay = index * 40

    const tick = () => {
      step++
      renderKey.current++
      if (step >= totalSteps) {
        setDisplayed(char)
        return
      }
      setDisplayed(DIGITS[Math.floor(Math.random() * 10)])
      const progress = step / totalSteps
      const interval = 50 + progress * 60
      timerRef.current = setTimeout(tick, interval)
    }

    timerRef.current = setTimeout(tick, baseDelay)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [char, index])

  return (
    <span className="inline-block overflow-hidden text-center relative" style={{ width: DIGITS.includes(char) ? '0.6em' : 'auto', height: '1.15em' }}>
      <AnimatePresence initial={false}>
        <motion.span
          key={displayed + '-' + renderKey.current}
          initial={{ y: '-110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '110%', opacity: 0 }}
          transition={{ duration: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {displayed}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function formatValue(value: number, format: FormatType, decimals?: number): string {
  switch (format) {
    case "compact":
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        minimumFractionDigits: decimals ?? 1,
        maximumFractionDigits: decimals ?? 1,
      }).format(value)
    case "percent":
      return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: decimals ?? 2,
        maximumFractionDigits: decimals ?? 2,
      }).format(value / 100)
    case "raw":
    default:
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals ?? 0,
        maximumFractionDigits: decimals ?? 0,
      }).format(value)
  }
}

function SlotMachineNumber({ value, format = "raw", decimals }: { value: number; format?: FormatType; decimals?: number }) {
  const formatted = formatValue(value, format, decimals)
  return (
    <span className="inline-flex items-center">
      {formatted.split('').map((ch, i) => (
        <SlotDigit key={i} char={ch} index={i} />
      ))}
    </span>
  )
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
          <SlotMachineNumber
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
