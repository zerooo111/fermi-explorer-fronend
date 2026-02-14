import { Separator as BaseSeparator } from "@base-ui/react/separator"
import { cn } from "@/shared/lib/utils"

interface SeparatorProps extends React.ComponentProps<typeof BaseSeparator> {
  orientation?: "horizontal" | "vertical"
}

function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <BaseSeparator
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
