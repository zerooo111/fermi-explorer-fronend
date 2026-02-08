import React, { useState } from "react"
import { cn } from "@/lib/utils"

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error("PopoverTrigger must be used within Popover")
  
  return (
    <button
      onClick={() => context.setOpen(!context.open)}
      {...props}
    />
  )
}

function PopoverContent({ className, children, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error("PopoverContent must be used within Popover")
  
  if (!context.open) return null
  
  return (
    <div
      className={cn(
        "absolute z-50 w-72 border border-border bg-card p-4 shadow-lg top-full right-0 mt-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function PopoverTitle({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function PopoverClose(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(PopoverContext)
  return (
    <button
      onClick={() => context?.setOpen(false)}
      {...props}
    />
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose }
