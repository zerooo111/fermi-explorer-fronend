import type { SpringOptions } from "motion/react"

// Spring configs
export const springs = {
  snappy: { type: "spring", stiffness: 500, damping: 30 } as const satisfies SpringOptions & { type: "spring" },
  gentle: { type: "spring", stiffness: 200, damping: 20 } as const satisfies SpringOptions & { type: "spring" },
  bouncy: { type: "spring", stiffness: 400, damping: 15 } as const satisfies SpringOptions & { type: "spring" },
}

// Reusable animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}
