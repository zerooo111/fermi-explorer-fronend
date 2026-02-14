import { Popover as BasePopover } from "@base-ui/react/popover"
import { cn } from "@/shared/lib/utils"

function Popover(props: React.ComponentProps<typeof BasePopover.Root>) {
  return <BasePopover.Root {...props} />
}

function PopoverTrigger(props: React.ComponentProps<typeof BasePopover.Trigger>) {
  return <BasePopover.Trigger {...props} />
}

function PopoverContent({ className, children, ...props }: React.ComponentProps<typeof BasePopover.Popup>) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner>
        <BasePopover.Popup
          className={cn(
            "z-[100] w-72 border border-border bg-card p-4 shadow-lg opacity-0 translate-y-1 transition-[opacity,transform] duration-150 data-[open]:opacity-100 data-[open]:translate-y-0 data-[starting-style]:opacity-0 data-[starting-style]:translate-y-1 data-[ending-style]:opacity-0 data-[ending-style]:translate-y-1",
            className
          )}
          {...props}
        >
          {children}
          <BasePopover.Arrow className="fill-card stroke-border" />
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<typeof BasePopover.Title>) {
  return (
    <BasePopover.Title
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: React.ComponentProps<typeof BasePopover.Description>) {
  return (
    <BasePopover.Description
      className={cn("mt-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function PopoverClose(props: React.ComponentProps<typeof BasePopover.Close>) {
  return <BasePopover.Close {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose }
