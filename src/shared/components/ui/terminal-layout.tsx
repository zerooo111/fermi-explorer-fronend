import { type ReactNode } from "react"
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
} from "react-resizable-panels"
import { GripVertical } from "lucide-react"

// --- TerminalLayout ---
interface TerminalLayoutProps extends Omit<GroupProps, "children"> {
  children: ReactNode
}

export function TerminalLayout({ children, ...props }: TerminalLayoutProps) {
  return (
    <Group {...props}>
      {children}
    </Group>
  )
}

// --- TerminalPanel ---
interface TerminalPanelProps extends Omit<PanelProps, "children"> {
  title: string
  children: ReactNode
}

export function TerminalPanel({ title, children, ...props }: TerminalPanelProps) {
  return (
    <Panel {...props}>
      <div className="flex h-full flex-col overflow-hidden bg-background">
        {/* Title bar */}
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-border bg-card px-3">
          <div className="flex items-center gap-2">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {title}
            </span>
          </div>
        </div>
        {/* Content */}
        <div className="min-h-0 flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </Panel>
  )
}

// --- TerminalHandle ---
export function TerminalHandle() {
  return <Separator />
}

// Re-export for nested layouts
export { Panel }
