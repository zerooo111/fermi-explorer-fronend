import { useParams, Link } from '@tanstack/react-router'
import { useContinuumTick } from '@/features/continuum/api/hooks'
import type { Tick } from '@/shared/types/shared/api'
import {
  Card, Alert, AlertDescription, PageSkeleton, DetailSkeleton,
  Badge, Separator,
} from '@/shared/components/ui'
import { Breadcrumbs, HashDisplay, TimestampDisplay, EmptyState } from '@/features/continuum/components/v2/shared'
import { Cube, ArrowLeft, ArrowsClockwise } from '@phosphor-icons/react'

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 px-3 py-2">
      <span className="shrink-0 sm:w-32 text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-xs text-foreground min-w-0">
        {children}
      </span>
    </div>
  )
}

export default function TickDetailPage() {
  const { tickId } = useParams({ from: '/sequencing/tick/$tickId' })
  const tickNumber = parseInt(tickId, 10)
  const { data: rawTick, isLoading, isError, error } = useContinuumTick(tickNumber)
  const tick = rawTick as (Tick & { transactions?: Array<{ tx_hash: string; tx_id: string; sequence_number: number; nonce: number }> }) | undefined

  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-1/3">
        <DetailSkeleton rows={8} />
      </PageSkeleton>
    )
  }

  if (isError) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <Alert variant="error">
          <AlertDescription>
            Error loading tick: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
        <Link to="/sequencing" className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft weight="bold" className="w-3.5 h-3.5" /> Back to Sequencing
        </Link>
      </div>
    )
  }

  if (!tick?.tick_number) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <EmptyState message="Tick not found" description="The requested tick does not exist or is not yet available." />
        <div className="flex justify-center mt-4">
          <Link to="/sequencing" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft weight="bold" className="w-3.5 h-3.5" /> Back to Sequencing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <Breadcrumbs items={[
        { label: 'Sequencing', href: '/sequencing' },
        { label: 'Ticks', href: '/sequencing/ticks' },
        { label: `Tick #${tick.tick_number}` },
      ]} />

      <h1 className="flex items-center gap-2 font-pixel text-lg text-accent">
        <Cube weight="duotone" className="w-5 h-5 text-accent" />
        Tick #{tick.tick_number.toLocaleString()}
      </h1>

      {/* Tick details */}
      <Card variant="default" className="p-0 gap-0">
        <DetailRow label="Tick Number">
          #{tick.tick_number.toLocaleString()}
        </DetailRow>
        <Separator />
        <DetailRow label="Timestamp">
          <TimestampDisplay timestamp={tick.timestamp} />
        </DetailRow>
        <Separator />
        <DetailRow label="Transactions">
          <Badge variant={tick.transaction_count > 0 ? 'success' : 'muted'}>{tick.transaction_count}</Badge>
        </DetailRow>
        <Separator />
        <DetailRow label="Batch Hash">
          <HashDisplay hash={tick.transaction_batch_hash} />
        </DetailRow>
        {tick.vdf_proof && (
          <>
            <Separator />
            <DetailRow label="VDF Iterations">
              {tick.vdf_proof.iterations.toLocaleString()}
            </DetailRow>
            <Separator />
            <DetailRow label="VDF Input">
              <code className="break-all">{tick.vdf_proof.input}</code>
            </DetailRow>
            <Separator />
            <DetailRow label="VDF Output">
              <code className="break-all">{tick.vdf_proof.output}</code>
            </DetailRow>
            <Separator />
            <DetailRow label="VDF Proof">
              <code className="break-all">{tick.vdf_proof.proof}</code>
            </DetailRow>
          </>
        )}
        {tick.previous_output && (
          <>
            <Separator />
            <DetailRow label="Previous Output">
              <code className="break-all">{tick.previous_output}</code>
            </DetailRow>
          </>
        )}
      </Card>

      {/* Transactions in this tick */}
      {tick.transactions && tick.transactions.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-pixel text-lg text-accent mb-3">
            <ArrowsClockwise weight="duotone" className="w-5 h-5 text-accent" />
            Transactions ({tick.transactions.length})
          </h2>

          <Card variant="default" className="p-0 gap-0">
            {tick.transactions.map((tx, i) => (
              <div key={tx.tx_hash}>
                {i > 0 && <Separator />}
                <Link
                  to="/sequencing/tx/$transactionId"
                  params={{ transactionId: tx.tx_hash }}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-3 py-2 hover:bg-secondary/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <HashDisplay hash={tx.tx_hash} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="muted">Seq #{tx.sequence_number}</Badge>
                    <Badge variant="muted">Nonce {tx.nonce}</Badge>
                  </div>
                </Link>
              </div>
            ))}
          </Card>
        </section>
      )}

      <div>
        <Link to="/sequencing" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft weight="bold" className="w-3.5 h-3.5" /> Back to Sequencing
        </Link>
      </div>
    </div>
  )
}
