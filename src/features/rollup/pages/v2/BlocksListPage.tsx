import { useState, useCallback } from 'react'
import { BlocksDataTable } from '@/features/rollup/components/v2/blocks'
import { Breadcrumbs } from '@/features/continuum/components/v2/shared'
import { Button } from '@/shared/components/ui'

export default function BlocksListPage() {
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const handlePrev = useCallback(() => setOffset(o => Math.max(0, o - limit)), [limit])
  const handleNext = useCallback(() => setOffset(o => o + limit), [limit])

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-6">
      <Breadcrumbs items={[
        { label: 'Execution', href: '/execution' },
        { label: 'Blocks' },
      ]} />

      <h1 className="font-pixel text-lg sm:text-xl font-bold text-foreground">All Blocks</h1>

      <BlocksDataTable limit={limit} offset={offset} />

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" onClick={handlePrev} disabled={offset === 0} className="text-xs font-mono">
          Previous
        </Button>
        <span className="text-xs font-mono text-muted-foreground">
          Page {Math.floor(offset / limit) + 1}
        </span>
        <Button variant="ghost" onClick={handleNext} className="text-xs font-mono">
          Next
        </Button>
      </div>
    </div>
  )
}
