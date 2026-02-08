import { cn } from '@/shared/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex w-full border border-border bg-card px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
