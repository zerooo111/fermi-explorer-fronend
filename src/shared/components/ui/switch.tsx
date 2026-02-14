import { Switch as BaseSwitch } from "@base-ui/react/switch"
import { motion } from "motion/react"
import { useState } from "react"
import { cn } from "@/shared/lib/utils"

interface SwitchProps extends React.ComponentProps<typeof BaseSwitch.Root> {}

function Switch({ className, checked: controlledChecked, defaultChecked, onCheckedChange, ...props }: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false)
  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const handleCheckedChange: typeof onCheckedChange = (value, event) => {
    if (!isControlled) {
      setInternalChecked(value)
    }
    onCheckedChange?.(value, event)
  }

  return (
    <BaseSwitch.Root
      className={cn(
        "group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-accent/20 border-accent/40"
          : "bg-secondary border-border",
        className
      )}
      checked={controlledChecked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      {...props}
    >
      <BaseSwitch.Thumb
        className={cn(
          "pointer-events-none block h-3 w-3",
          checked ? "bg-accent" : "bg-muted-foreground"
        )}
        render={
          <motion.span
            animate={{ x: checked ? 20 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        }
      />
    </BaseSwitch.Root>
  )
}

export { Switch }
