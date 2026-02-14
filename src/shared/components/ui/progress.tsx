import { Progress as BaseProgress } from "@base-ui/react/progress"
import { cn } from "@/shared/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof BaseProgress.Root> {
  showValue?: boolean
}

function Progress({ className, showValue, ...props }: ProgressProps) {
  return (
    <BaseProgress.Root className={cn("flex flex-col gap-2", className)} {...props}>
      {showValue && (
        <div className="flex items-center justify-between">
          <BaseProgress.Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground" />
          <BaseProgress.Value className="font-mono text-[10px] text-foreground" />
        </div>
      )}
      <BaseProgress.Track className="relative h-2 w-full overflow-hidden bg-secondary rounded-full">
        <BaseProgress.Indicator className="h-full bg-accent transition-all" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  )
}

export { Progress }
