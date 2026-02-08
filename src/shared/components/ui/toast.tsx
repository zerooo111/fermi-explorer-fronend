import { motion } from "motion/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { springs } from "@/lib/motion"
import React from "react"

const ToastContext = React.createContext<any>(null)

function ToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastContext.Provider value={{}}>{children}</ToastContext.Provider>
}

function ToastViewport({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, children, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden border border-border bg-card p-4 shadow-lg",
        className
      )}
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={springs.snappy}
      {...props}
    >
      {children}
    </motion.div>
  )
}

function ToastTitle({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastAction(props: React.HTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />
}

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction }
