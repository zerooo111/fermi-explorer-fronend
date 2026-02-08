import { motion } from "motion/react"
import { springs } from "@/shared/lib/motion"
import { cn } from "@/shared/lib/utils"

interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  staggerDelay?: number
  once?: boolean
}

interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const containerVariants = (staggerDelay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
})

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

function Stagger({
  staggerDelay = 0.05,
  once = true,
  className,
  children,
  ...props
}: StaggerProps) {
  return (
    <motion.div
      variants={containerVariants(staggerDelay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({ className, children, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      transition={springs.gentle}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { Stagger, StaggerItem }
export type { StaggerProps, StaggerItemProps }
