import React from 'react'
import { motion } from 'motion/react'

import { cn } from '@/shared/lib/utils'

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>
}

function TooltipTrigger(props: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} />
}

function TooltipContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={cn(
        "z-50 border border-border bg-card px-2 py-1 font-mono text-[11px] text-foreground shadow-md absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
