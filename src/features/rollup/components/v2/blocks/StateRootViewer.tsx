import { memo, useState, useCallback } from 'react'
import { TreeStructure, ArrowsLeftRight } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui'
import { HashDisplay } from '@/features/continuum/components/v2/shared'

interface StateRootViewerProps {
  current: number[]
  previous?: number[]
}

function stateRootToHex(root: number[]): string {
  return '0x' + root.map(b => b.toString(16).padStart(2, '0')).join('')
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
    <div className="border border-border divide-y divide-border">
      {/* Current state root — compact row */}
      <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
        <TreeStructure weight="duotone" className="w-4 h-4 text-muted-foreground/70 shrink-0" />
        <span className="font-pixel text-[10px] uppercase tracking-[0.15em] text-muted-foreground shrink-0">
          State Root
        </span>
        <HashDisplay hash={currentHex} prefixLength={16} suffixLength={12} className="ml-auto" />
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
