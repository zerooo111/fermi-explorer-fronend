import { Input as BaseInput } from "@base-ui/react/input"
import { Field as BaseField } from "@base-ui/react/field"
import { cn } from "@/shared/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input({ className, ...props }: InputProps) {
  return (
    <BaseInput
      className={cn(
        "flex w-full border border-border bg-card px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function Field(props: React.ComponentProps<typeof BaseField.Root>) {
  return <BaseField.Root {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof BaseField.Label>) {
  return (
    <BaseField.Label
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<typeof BaseField.Description>) {
  return (
    <BaseField.Description
      className={cn("text-[10px] text-muted-foreground", className)}
      {...props}
    />
  )
}

function FieldError({ className, ...props }: React.ComponentProps<typeof BaseField.Error>) {
  return (
    <BaseField.Error
      className={cn("text-[10px] text-destructive", className)}
      {...props}
    />
  )
}

function FieldControl({ className, ...props }: React.ComponentProps<typeof BaseField.Control>) {
  return (
    <BaseField.Control
      className={cn(
        "flex w-full border border-border bg-card px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input, Field, FieldLabel, FieldDescription, FieldError, FieldControl }
export type { InputProps }
