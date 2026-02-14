import { useParams, Link } from '@tanstack/react-router'
import { useMarkets } from '@/features/rollup/api/hooks'
import type { MarketsResponse } from '@/features/rollup/types/api'
import { Breadcrumbs, HashDisplay, EmptyState } from '@/features/continuum/components/v2/shared'
import {
  Card, CardContent, Badge, Button, PageSkeleton,
  Table, TableBody, TableCell, TableRow, Skeleton,
} from '@/shared/components/ui'

export default function MarketDetailPage() {
  const { marketId } = useParams({ from: '/execution/markets/$marketId' })
  const { data: rawData, isLoading } = useMarkets()
  const data = rawData as MarketsResponse | undefined

  const market = data?.markets?.find(m => m.id === marketId)

  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-1/3">
        <Skeleton className="h-48 w-full" />
      </PageSkeleton>
    )
  }

  if (!market) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <EmptyState message="Market not found" />
        <div className="flex justify-center mt-4">
          <Link to="/execution/markets"><Button variant="default">Return to markets</Button></Link>
        </div>
      </div>
    )
  }

  const rows = [
    { label: 'Market ID', value: <code className="font-mono text-xs break-all">{market.id}</code> },
    { label: 'Name', value: <span className="font-mono text-sm font-medium">{market.name}</span> },
    { label: 'Kind', value: <Badge variant={market.kind === 'Perp' ? 'warning' : 'success'}>{market.kind === 'Perp' ? 'Perpetual' : 'Spot'}</Badge> },
    { label: 'Base Mint', value: <HashDisplay hash={market.base_mint} /> },
    { label: 'Quote Mint', value: <HashDisplay hash={market.quote_mint} /> },
    ...(market.perp_config ? [
      { label: 'Max Leverage', value: <span className="font-mono text-xs">{market.perp_config.max_leverage}x</span> },
      { label: 'Initial Margin', value: <span className="font-mono text-xs">{market.perp_config.initial_margin_bps} bps</span> },
      { label: 'Maintenance Margin', value: <span className="font-mono text-xs">{market.perp_config.maintenance_margin_bps} bps</span> },
      { label: 'Funding Interval', value: <span className="font-mono text-xs">{market.perp_config.funding_interval_seconds}s</span> },
    ] : []),
  ]

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Breadcrumbs items={[
        { label: 'Execution', href: '/execution' },
        { label: 'Markets', href: '/execution/markets' },
        { label: market.name },
      ]} />

      <h1 className="text-lg sm:text-xl font-bold text-foreground">{market.name}</h1>

      <Card variant="default">
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.label}>
                  <TableCell className="text-xs py-3 bg-secondary sm:text-sm font-mono whitespace-nowrap w-44">
                    {row.label}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <Link to="/execution/markets">
          <Button variant="default">Return to markets</Button>
        </Link>
      </div>
    </div>
  )
}
