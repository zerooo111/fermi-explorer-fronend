import { memo } from 'react'
import { Badge } from '@/shared/components/ui'

type Status = 'pending' | 'confirmed' | 'finalized' | 'error'

const statusVariantMap: Record<Status, 'warning' | 'success' | 'muted' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'success',
  finalized: 'muted',
  error: 'destructive',
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export const StatusBadge = memo(function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status]} className={className}>
      {status}
    </Badge>
  )
})
