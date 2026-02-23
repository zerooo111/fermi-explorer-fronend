import { memo, useMemo, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useMarkets } from '@/features/rollup/api/hooks'
import type { Market, MarketsResponse } from '@/features/rollup/types/api'
import { Card, Badge, Skeleton, Tabs, TabsList, TabsTrigger, Stagger, StaggerItem } from '@/shared/components/ui'
import { EmptyState } from '@/features/continuum/components/v2/shared'

type FilterTab = 'All' | 'Spot' | 'Perp'

const MarketCard = memo(function MarketCard({ market }: { market: Market }) {
  return (
    <Link to="/execution/markets/$marketId" params={{ marketId: market.id }} className="group">
      <Card variant="interactive" className="p-4 gap-3 h-full">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-medium text-foreground">
            {market.name}
          </span>
          <Badge variant={market.kind === 'Perp' ? 'warning' : 'success'} className="text-[9px]">
            {market.kind === 'Perp' ? 'Perpetual' : 'Spot'}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Base Mint</span>
            <code className="font-mono text-foreground">{market.base_mint.slice(0, 6)}...{market.base_mint.slice(-4)}</code>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Quote Mint</span>
            <code className="font-mono text-foreground">{market.quote_mint.slice(0, 6)}...{market.quote_mint.slice(-4)}</code>
          </div>
          {market.perp_config && (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Max Leverage</span>
                <span className="font-mono text-foreground">{market.perp_config.max_leverage}x</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Initial Margin</span>
                <span className="font-mono text-foreground">{market.perp_config.initial_margin_bps} bps</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          View details
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  )
})

interface MarketsGridProps {
  className?: string
}

export function MarketsGrid({ className }: MarketsGridProps) {
  const { data: rawData, isLoading } = useMarkets()
  const data = rawData as MarketsResponse | undefined
  const [filter, setFilter] = useState<FilterTab>('All')
  const handleFilter = useCallback((tab: FilterTab) => setFilter(tab), [])

  const allMarkets = useMemo(() => data?.markets ?? [], [data])
  const markets = useMemo(() => {
    if (filter === 'All') return allMarkets
    return allMarkets.filter(m => m.kind === filter)
  }, [allMarkets, filter])

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Tabs>
        <TabsList className="mb-6">
          {(['All', 'Spot', 'Perp'] as FilterTab[]).map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              data-selected={filter === tab ? '' : undefined}
              onClick={() => handleFilter(tab)}
            >
              {tab === 'Perp' ? 'Perpetual' : tab}
              {tab !== 'All' && (
                <span className="ml-2 text-[10px] text-muted-foreground">
                  ({allMarkets.filter(m => m.kind === tab).length})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {markets.length === 0 ? (
        <EmptyState
          message="No markets found"
          description={filter !== 'All' ? `No ${filter.toLowerCase()} markets available` : undefined}
        />
      ) : (
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-live="polite">
          {markets.map(market => (
            <StaggerItem key={market.id}>
              <MarketCard market={market} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}

export default MarketsGrid
