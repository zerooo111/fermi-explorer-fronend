import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area"
import { cn } from "@/shared/lib/utils"

interface ScrollAreaProps extends React.ComponentProps<typeof BaseScrollArea.Root> {}

function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root className={cn("relative overflow-hidden", className)} {...props}>
      <BaseScrollArea.Viewport className="h-full w-full">
        <BaseScrollArea.Content>
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar className="flex touch-none select-none p-1 transition-colors data-[orientation=horizontal]:h-3 data-[orientation=vertical]:w-3 data-[orientation=horizontal]:flex-col" orientation="vertical">
        <BaseScrollArea.Thumb className="relative flex-1 bg-border transition-colors hover:bg-muted-foreground" />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar className="flex touch-none select-none p-1 transition-colors data-[orientation=horizontal]:h-3 data-[orientation=vertical]:w-3 data-[orientation=horizontal]:flex-col" orientation="horizontal">
        <BaseScrollArea.Thumb className="relative flex-1 bg-border transition-colors hover:bg-muted-foreground" />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  )
}

export { ScrollArea }
