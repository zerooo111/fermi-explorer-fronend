import { Toast as BaseToast } from "@base-ui/react/toast"
import { motion } from "motion/react"
import { X } from "lucide-react"
import { cn } from "@/shared/lib/utils"

function ToastProvider(props: React.ComponentProps<typeof BaseToast.Provider>) {
  return <BaseToast.Provider {...props} />
}

function ToastViewport({ className, ...props }: React.ComponentProps<typeof BaseToast.Viewport>) {
  return (
    <BaseToast.Viewport
      className={cn(
        "pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px] [&>*]:pointer-events-auto",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, children, ...props }: React.ComponentProps<typeof BaseToast.Root>) {
  return (
    <BaseToast.Root
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden border border-border bg-card p-4 shadow-lg",
        className
      )}
      {...props}
    >
      <motion.div
        className="flex w-full items-center justify-between gap-4"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {children}
        <BaseToast.Close className="shrink-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </BaseToast.Close>
      </motion.div>
    </BaseToast.Root>
  )
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof BaseToast.Title>) {
  return (
    <BaseToast.Title
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: React.ComponentProps<typeof BaseToast.Description>) {
  return (
    <BaseToast.Description
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastAction(props: React.ComponentProps<typeof BaseToast.Action>) {
  return <BaseToast.Action {...props} />
}

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction }
