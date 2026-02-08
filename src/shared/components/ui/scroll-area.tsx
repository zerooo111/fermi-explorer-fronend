import { cn } from '@/shared/lib/utils'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div className={cn("relative overflow-auto", className)} {...props}>
      {children}
    </div>
  )
}

export { ScrollArea }
