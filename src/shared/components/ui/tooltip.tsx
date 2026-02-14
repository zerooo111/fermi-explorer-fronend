import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import { motion } from "motion/react"
import { cn } from "@/shared/lib/utils"

function TooltipProvider(props: React.ComponentProps<typeof BaseTooltip.Provider>) {
  return <BaseTooltip.Provider {...props} />
}

function Tooltip(props: React.ComponentProps<typeof BaseTooltip.Root>) {
  return <BaseTooltip.Root {...props} />
}

function TooltipTrigger(props: React.ComponentProps<typeof BaseTooltip.Trigger>) {
  return <BaseTooltip.Trigger {...props} />
}

function TooltipContent({ className, children, ...props }: React.ComponentProps<typeof BaseTooltip.Popup>) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner>
        <BaseTooltip.Popup
          className={cn(
            "z-50 border border-border bg-card px-2 py-1 font-mono text-[11px] text-foreground shadow-md",
            className
          )}
          render={
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          }
          {...props}
        >
          {children}
          <BaseTooltip.Arrow className="fill-card stroke-border" />
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  )
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
