import { RecentTicks } from '@/components/RecentTicks'
import { ChainStatus } from '@/components/ChainStatus'

export default function Homepage() {
  return (
    <div className="space-y-8 container mx-auto max-w-screen-xl px-6">
      <ChainStatus />
    </div>
  )
}
