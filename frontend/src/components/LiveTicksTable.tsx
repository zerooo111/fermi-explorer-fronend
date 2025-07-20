import { TicksTable } from './TicksTable'
import { useTickStream } from '@/hooks'

export function LiveTicksTable() {
  const { ticks } = useTickStream({
    displayLimit: 10,
  })

  return (
    <div className="space-y-4 w-40 border border-red-500">
      <h3 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase">
        Live Ticks
      </h3>
      <TicksTable ticks={ticks} />
    </div>
  )
}
