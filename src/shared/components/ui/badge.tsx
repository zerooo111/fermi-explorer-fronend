import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-2 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        success: "border-success/30 bg-success/10 text-success",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        warning: "border-warning/30 bg-warning/10 text-warning",
        muted: "border-border bg-secondary text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
