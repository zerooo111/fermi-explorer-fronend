import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const alertVariants = cva(
  "flex items-start gap-3 border p-4",
  {
    variants: {
      variant: {
        info: "border-border bg-card",
        warning: "border-warning/30 bg-warning/5",
        error: "border-destructive/30 bg-destructive/5",
        success: "border-success/30 bg-success/5",
      },
    },
    defaultVariants: { variant: "info" },
  }
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant, className }))} {...props} />
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-sm text-foreground", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-xs text-muted-foreground", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
