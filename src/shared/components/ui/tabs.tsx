import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { cn } from "@/shared/lib/utils"

function Tabs(props: React.ComponentProps<typeof BaseTabs.Root>) {
  return <BaseTabs.Root {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn(
        "flex items-center gap-0 border-b border-border",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "relative px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground data-[selected]:text-foreground bg-transparent border-none cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      className={cn("mt-6", className)}
      {...props}
    />
  )
}

function TabsIndicator({ className, ...props }: React.ComponentProps<typeof BaseTabs.Indicator>) {
  return (
    <BaseTabs.Indicator
      className={cn(
        "absolute bottom-0 h-1 bg-accent transition-all",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator }
