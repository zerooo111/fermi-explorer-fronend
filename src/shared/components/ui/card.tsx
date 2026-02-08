import { motion } from "motion/react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"
import { springs } from "@/shared/lib/motion"

const cardVariants = cva("flex flex-col gap-3 p-6", {
  variants: {
    variant: {
      default: "border border-border bg-card",
      ghost: "bg-transparent",
      interactive:
        "border border-border bg-card transition-colors hover:bg-secondary cursor-pointer",
    },
  },
  defaultVariants: { variant: "default" },
})

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  if (variant === "interactive") {
    return (
      <motion.div
        className={cn(cardVariants({ variant, className }))}
        whileHover={{ y: -2 }}
        transition={springs.gentle}
        {...props}
      />
    )
  }
  return <div className={cn(cardVariants({ variant, className }))} {...props} />
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-medium text-foreground", className)} {...props} />
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props} />
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }
