import { motion } from 'motion/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

const MotionButton = motion.create('button')

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background hover:opacity-90',
        accent: 'bg-accent text-accent-foreground hover:opacity-90',
        success: 'bg-success text-success-foreground hover:opacity-90',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        outline: 'border border-border bg-transparent text-foreground hover:bg-card',
        ghost: 'bg-transparent text-muted-foreground hover:text-foreground',
        link: 'bg-transparent text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'px-3 py-1 text-xs',
        default: 'px-4 py-2 text-sm',
        lg: 'px-8 py-3 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

function Button({ className, variant, size, loading, disabled, children, ...props }: ButtonProps) {
  const isDisabled = disabled || loading
  return (
    <MotionButton
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </MotionButton>
  )
}

export { Button, buttonVariants }
