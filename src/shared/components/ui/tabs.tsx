import { cn } from '@/shared/lib/utils'

function Tabs(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-0 border-b border-border',
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'relative px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground data-[selected]:text-foreground bg-transparent border-none cursor-pointer',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6", className)}
      {...props}
    />
  )
}

function TabsIndicator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute bottom-0 h-0.5 bg-accent transition-all",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator }
