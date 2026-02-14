import { memo, useState, useCallback } from 'react'
import { Card, CardContent, Badge, Button } from '@/shared/components/ui'
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
    <Card variant="default">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            State Root
          </span>
          {previousHex && (
            <Button variant="ghost" onClick={toggleDiff} className="text-[10px] font-mono">
              {showDiff ? 'Hide Diff' : 'Show Diff'}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-[9px]">Current</Badge>
            <HashDisplay hash={currentHex} prefixLength={10} suffixLength={10} />
          </div>

          {showDiff && previousHex && (
            <div className="flex items-center gap-2">
              <Badge variant="muted" className="text-[9px]">Previous</Badge>
              <HashDisplay hash={previousHex} prefixLength={10} suffixLength={10} />
            </div>
          )}

          {showDiff && previousHex && (
            <div className="border border-border p-3 mt-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                Byte Diff
              </span>
              <div className="font-mono text-xs flex flex-wrap gap-0.5">
                {current.map((byte, i) => {
                  const prevByte = previous?.[i]
                  const changed = prevByte !== undefined && prevByte !== byte
                  return (
                    <span
                      key={i}
                      className={changed ? 'text-success bg-success/10 px-0.5' : 'text-muted-foreground'}
                    >
                      {byte.toString(16).padStart(2, '0')}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
