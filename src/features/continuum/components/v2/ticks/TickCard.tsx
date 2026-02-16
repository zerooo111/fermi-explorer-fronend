import { memo } from 'react'
import { Link } from '@tanstack/react-router'
import type { TickSummary } from '@/shared/types/shared/api'
import { Card, Badge } from '@/shared/components/ui'
import { TimestampDisplay } from '../shared'
import { Cube } from '@phosphor-icons/react'

interface TickCardProps {
  tick: TickSummary
}

export const TickCard = memo(function TickCard({ tick }: TickCardProps) {
  return (
    <Link to="/sequencing/tick/$tickId" params={{ tickId: String(tick.tick_number) }}>
      <Card variant="interactive" className="p-4 gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-sm font-medium text-foreground">
            <Cube weight="duotone" className="w-3.5 h-3.5 text-accent" />
            #{tick.tick_number.toLocaleString()}
          </span>
          <TimestampDisplay timestamp={tick.timestamp} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Transactions</span>
          <Badge variant={tick.transaction_count > 0 ? 'success' : 'muted'}>
            {tick.transaction_count}
          </Badge>
        </div>
      </Card>
    </Link>
  )
})
