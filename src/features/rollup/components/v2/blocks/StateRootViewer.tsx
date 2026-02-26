import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { TreeStructure, ArrowsLeftRight } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/shared/components/ui'
import { HashDisplay } from '@/features/continuum/components/v2/shared'

interface StateRootViewerProps {
  current: number[]
  previous?: number[]
}

function stateRootToHex(root: number[]): string {
  return '0x' + root.map(b => b.toString(16).padStart(2, '0')).join('')
}

const HEX_CHARS = '0123456789abcdef'

/**
 * Single character slot that "rolls" through random hex digits
 * before landing on the final value, with a staggered delay per position.
 */
function SlotChar({ char, index }: { char: string; index: number }) {
  const prevChar = useRef(char)
  const [displayed, setDisplayed] = useState(char)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (prevChar.current === char) return
    prevChar.current = char

    const totalSteps = 5 + Math.floor(Math.random() * 3)
    const baseDelay = index * 8 // stagger start per character position
    let step = 0

    const tick = () => {
      step++
      if (step >= totalSteps) {
        setDisplayed(char)
        return
      }
      setDisplayed(HEX_CHARS[Math.floor(Math.random() * 16)])
      timerRef.current = setTimeout(tick, 40)
    }

    timerRef.current = setTimeout(tick, baseDelay)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [char, index])

  return (
    <span className="inline-block w-[0.6em] h-[1.15em] overflow-hidden text-center relative">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={displayed}
          initial={{ y: '-100%', opacity: 0.3 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0.3 }}
          transition={{ duration: 0.05, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {displayed}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function SlotMachineHash({ hex }: { hex: string }) {
  return (
    <code className="font-mono text-xs tabular-nums inline-flex items-center">
      {hex.split('').map((ch, i) => (
        <SlotChar key={i} char={ch} index={i} />
      ))}
    </code>
  )
}

export const StateRootViewer = memo(function StateRootViewer({
  current,
  previous,
}: StateRootViewerProps) {
  const [showDiff, setShowDiff] = useState(false)
  const toggleDiff = useCallback(() => setShowDiff(v => !v), [])

  const currentHex = stateRootToHex(current)
  const previousHex = previous ? stateRootToHex(previous) : null

  return (
    <div className="divide-y divide-border">
      {/* Current state root — compact row */}
      <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
        <TreeStructure weight="duotone" className="w-4 h-4 text-muted-foreground/70 shrink-0" />
        <span className="font-pixel text-[10px] uppercase tracking-[0.15em] text-muted-foreground shrink-0">
          State Root
        </span>
        <span className="ml-auto">
          <SlotMachineHash hex={currentHex} />
        </span>
      </div>

      {/* Previous + diff toggle */}
      {previousHex && (
        <div className="px-3 py-2 sm:px-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowsLeftRight weight="duotone" className="w-4 h-4 text-muted-foreground/70 shrink-0" />
              <span className="font-pixel text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Previous
              </span>
              <HashDisplay hash={previousHex} prefixLength={16} suffixLength={12} />
            </div>
            <Button variant="ghost" onClick={toggleDiff} className="text-[10px] font-mono h-6 px-2">
              {showDiff ? 'Hide Diff' : 'Diff'}
            </Button>
          </div>

          {showDiff && (
            <div className="font-mono text-xs flex flex-wrap gap-0.5 pb-1">
              {current.map((byte, i) => {
                const changed = previous?.[i] !== undefined && previous?.[i] !== byte
                return (
                  <span
                    key={i}
                    className={changed ? 'text-success bg-success/10 px-0.5 rounded-sm' : 'text-muted-foreground'}
                  >
                    {byte.toString(16).padStart(2, '0')}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
})
