import { motion } from "motion/react"
import { springs } from "@/shared/lib/motion"
import { cn } from "@/shared/lib/utils"

type Direction = "up" | "down" | "left" | "right" | "none"

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: Direction
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
}

function getDirectionOffset(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance }
    case "down":
      return { y: -distance }
    case "left":
      return { x: distance }
    case "right":
      return { x: -distance }
    case "none":
    default:
      return {}
  }
}

function Reveal({
  direction = "up",
  delay = 0,
  duration,
  distance = 16,
  once = true,
  className,
  children,
  ...props
}: RevealProps) {
  const offset = getDirectionOffset(direction, distance)

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once }}
      transition={{
        ...springs.gentle,
        delay,
        ...(duration ? { duration } : {}),
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { Reveal }
export type { RevealProps, Direction }
