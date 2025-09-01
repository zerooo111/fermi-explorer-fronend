import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium font-mono tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 border uppercase",
  {
    variants: {
      variant: {
        default:
          'bg-zinc-100 text-zinc-900 border-zinc-700 hover:bg-zinc-200 hover:border-zinc-600 focus-visible:ring-zinc-400',
        destructive:
          'bg-red-600 text-white border-red-700 hover:bg-red-700 hover:border-red-800 focus-visible:ring-red-400',
        outline:
          'border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-900 hover:border-zinc-600 focus-visible:ring-zinc-400',
        secondary:
          'bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 focus-visible:ring-zinc-400',
        ghost:
          'border-transparent text-zinc-100 hover:bg-zinc-900 hover:border-zinc-700 focus-visible:ring-zinc-400',
        link: 'border-transparent text-zinc-100 underline-offset-4 hover:underline focus-visible:ring-zinc-400',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
