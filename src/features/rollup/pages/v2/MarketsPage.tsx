import { MarketsGrid } from '@/features/rollup/components/v2/markets'
import { Breadcrumbs } from '@/features/continuum/components/v2/shared'

export default function MarketsPage() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-6">
      <Breadcrumbs items={[
        { label: 'Execution', href: '/execution' },
        { label: 'Markets' },
      ]} />

      <h1 className="font-pixel text-lg sm:text-xl font-bold text-foreground">Markets</h1>

      <MarketsGrid />
    </div>
  )
}
