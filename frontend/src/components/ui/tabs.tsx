import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex h-10 items-center justify-center border border-zinc-700 bg-zinc-950 text-zinc-400',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex h-10 flex-1 items-center justify-center text-sm font-medium font-mono tracking-wide uppercase transition-all',
        'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100',
        'border-r border-zinc-700 last:border-r-0',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'border border-zinc-700 bg-zinc-950 text-zinc-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400',
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
