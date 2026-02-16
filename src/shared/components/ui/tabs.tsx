import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

function Tabs(props: React.ComponentProps<typeof BaseTabs.Root>) {
  return <BaseTabs.Root {...props} />
}

/**
 * Variants:
 *
 * default  – Minimal underline. Bottom border baseline, active tab text lights up.
 *
 * pill     – Segmented control. Recessed track (bg-secondary), active segment
 *            pops forward with bg-card + border + subtle shadow. Feels tactile.
 *
 * card     – Accent indicator. Clean bottom border, active tab gets a 2px
 *            accent-colored bottom bar that overlays the border. The active tab
 *            also gets a subtle bg tint so it feels grounded, not floating.
 */

const tabsListVariants = cva("flex items-center", {
  variants: {
    variant: {
      default: "gap-0 border-b border-border",
      pill: "gap-1 bg-secondary/60 p-1 w-fit rounded-md",
      card: "gap-0 border-b border-border",
    },
  },
  defaultVariants: { variant: "default" },
})

interface TabsListProps
  extends React.ComponentProps<typeof BaseTabs.List>,
    VariantProps<typeof tabsListVariants> {}

function TabsList({ className, variant, ...props }: TabsListProps) {
  return (
    <BaseTabs.List
      data-variant={variant ?? "default"}
      className={cn(tabsListVariants({ variant, className }))}
      {...props}
    />
  )
}

const tabsTriggerVariants = cva(
  "relative font-mono text-[11px] uppercase tracking-[0.15em] transition-all cursor-pointer outline-none",
  {
    variants: {
      variant: {
        default:
          "px-4 py-2 border border-border bg-transparent text-muted-foreground hover:text-foreground data-[active]:text-foreground",
        pill: [
          "px-3 py-1.5 rounded border border-border bg-transparent text-muted-foreground",
          "hover:text-foreground",
          "data-[active]:bg-card data-[active]:text-foreground data-[active]:shadow-sm data-[active]:border-border/80",
        ].join(" "),
        card: [
          "px-4 py-2 border border-border bg-transparent text-muted-foreground -mb-px",
          "hover:text-foreground hover:bg-secondary/40",
          "data-[active]:text-accent data-[active]:bg-secondary/30",
          "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors",
          "data-[active]:after:bg-accent",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface TabsTriggerProps
  extends React.ComponentProps<typeof BaseTabs.Tab>,
    VariantProps<typeof tabsTriggerVariants> {}

function TabsTrigger({ className, variant, ...props }: TabsTriggerProps) {
  return (
    <BaseTabs.Tab
      className={cn(tabsTriggerVariants({ variant, className }))}
      {...props}
    />
  )
}

const tabsContentVariants = cva("", {
  variants: {
    variant: {
      default: "mt-6",
      pill: "mt-3",
      card: "mt-2",
    },
  },
  defaultVariants: { variant: "default" },
})

interface TabsContentProps
  extends React.ComponentProps<typeof BaseTabs.Panel>,
    VariantProps<typeof tabsContentVariants> {}

function TabsContent({ className, variant, ...props }: TabsContentProps) {
  return (
    <BaseTabs.Panel
      className={cn(tabsContentVariants({ variant, className }))}
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
