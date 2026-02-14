import { ChainMetrics } from '@/features/continuum/components/v2/metrics'
import { TickStream } from '@/features/continuum/components/v2/ticks'
import { Breadcrumbs } from '@/features/continuum/components/v2/shared'

export default function LiveStreamPage() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumbs items={[
        { label: 'Sequencing', href: '/sequencing' },
        { label: 'Live Stream' },
      ]} />

      <ChainMetrics />

      <TickStream displayLimit={100} />
    </div>
  )
}
