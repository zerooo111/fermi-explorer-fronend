import { ChainMetrics } from '@/features/continuum/components/v2/metrics'
import { TickStream } from '@/features/continuum/components/v2/ticks'
import { Breadcrumbs } from '@/features/continuum/components/v2/shared'
import { Broadcast } from '@phosphor-icons/react'

export default function LiveStreamPage() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumbs items={[
        { label: 'Sequencing', href: '/sequencing' },
        { label: 'Live Stream' },
      ]} />

      <h1 className="flex items-center gap-2 font-pixel text-sm uppercase tracking-[0.15em] text-foreground">
        <Broadcast weight="duotone" className="w-4 h-4 text-accent" />
        Live Stream
      </h1>

      <ChainMetrics />

      <TickStream displayLimit={100} />
    </div>
  )
}
