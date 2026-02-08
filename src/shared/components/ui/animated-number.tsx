import { useEffect, useRef } from "react"
import { useSpring } from "motion/react"
import { springs } from "@/shared/lib/motion"
import { cn } from "@/shared/lib/utils"

type FormatType = "currency" | "percent" | "compact" | "raw"

interface AnimatedNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  format?: FormatType
  locale?: string
  currency?: string
  decimals?: number
}

function formatValue(value: number, format: FormatType, locale: string, currency: string, decimals?: number): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: decimals ?? 2,
        maximumFractionDigits: decimals ?? 2,
      }).format(value)
    case "percent":
      return new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: decimals ?? 2,
        maximumFractionDigits: decimals ?? 2,
      }).format(value / 100)
    case "compact":
      return new Intl.NumberFormat(locale, {
        notation: "compact",
        minimumFractionDigits: decimals ?? 1,
        maximumFractionDigits: decimals ?? 1,
      }).format(value)
    case "raw":
    default:
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals ?? 0,
        maximumFractionDigits: decimals ?? 0,
      }).format(value)
  }
}

function AnimatedNumber({
  value,
  format = "raw",
  locale = "en-US",
  currency = "USD",
  decimals,
  className,
  ...props
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const springValue = useSpring(0, springs.snappy)

  useEffect(() => {
    springValue.set(value)
  }, [value, springValue])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest, format, locale, currency, decimals)
      }
    })
    return unsubscribe
  }, [springValue, format, locale, currency, decimals])

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      {...props}
    >
      {formatValue(value, format, locale, currency, decimals)}
    </span>
  )
}

export { AnimatedNumber }
export type { AnimatedNumberProps, FormatType }

