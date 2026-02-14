import { TicksDataTable } from '@/features/continuum/components/v2/ticks'
import { Breadcrumbs } from '@/features/continuum/components/v2/shared'

export default function TicksPage() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-6">
      <Breadcrumbs items={[
        { label: 'Sequencing', href: '/sequencing' },
        { label: 'Ticks' },
      ]} />

      <h1 className="text-lg sm:text-xl font-bold text-foreground">All Ticks</h1>

      <TicksDataTable limit={50} />
    </div>
  )
}
