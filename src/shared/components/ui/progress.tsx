import { cn } from "@/shared/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showValue?: boolean
}

function Progress({ className, value = 0, max = 100, showValue, ...props }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {showValue && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Progress</span>
          <span className="font-mono text-[10px] text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="relative h-1.5 w-full overflow-hidden bg-secondary rounded-full">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export { Progress }
