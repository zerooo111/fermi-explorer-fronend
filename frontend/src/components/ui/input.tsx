import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 border border-zinc-700 bg-zinc-950 px-3 py-1 text-sm text-zinc-100 font-mono transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-100',
        'placeholder:text-zinc-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:border-zinc-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'selection:bg-zinc-600 selection:text-zinc-100',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
