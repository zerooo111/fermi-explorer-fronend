import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useQueryClient } from '@tanstack/react-query'
import { ChainMetrics } from '@/features/continuum/components/v2/metrics'
import { useContinuumRecentTransactions } from '@/features/continuum/api/hooks'
import type { ContinuumRecentTransactionsResponse } from '@/shared/types/shared/api'
import type { StatusResponse } from '@/shared/types/api/health'
import { ArrowsClockwise, Hash, Cube } from '@phosphor-icons/react'
import { Card, Badge, Skeleton, Switch } from '@/shared/components/ui'
import { HashDisplay, TimestampDisplay, EmptyState } from '@/features/continuum/components/v2/shared'

type Transaction = ContinuumRecentTransactionsResponse['transactions'][number]

const DISPLAY_LIMIT = 10
const POLL_INTERVAL = 3000
const DRIP_BUDGET_MS = POLL_INTERVAL * 0.8
const MIN_DRIP_MS = 150
const MAX_DRIP_MS = 500

function useDripFeed(polled: Transaction[], reduced: boolean) {
  const [visible, setVisible] = useState<Transaction[]>([])
  const [freshHashes, setFreshHashes] = useState<Set<string>>(new Set())
  const queueRef = useRef<Transaction[]>([])
  const knownRef = useRef<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const initialRef = useRef(true)

  const dripNext = useCallback(() => {
    const queue = queueRef.current
    if (queue.length === 0) {
      // All dripped — fade out the accent borders after a short pause
      fadeTimerRef.current = setTimeout(() => setFreshHashes(new Set()), 1500)
      return
    }

    const next = queue.shift()!
    knownRef.current.add(next.tx_hash)
    setFreshHashes(prev => new Set(prev).add(next.tx_hash))

    setVisible(prev => {
      const merged = [next, ...prev.filter(t => t.tx_hash !== next.tx_hash)]
      return merged.slice(0, DISPLAY_LIMIT)
    })

    if (queue.length > 0) {
      const interval = Math.min(
        MAX_DRIP_MS,
        Math.max(MIN_DRIP_MS, DRIP_BUDGET_MS / (queue.length + 1)),
      )
      timerRef.current = setTimeout(dripNext, interval)
    }
  }, [])

  useEffect(() => {
    if (polled.length === 0) return

    if (initialRef.current) {
      initialRef.current = false
      const initial = polled.slice(0, DISPLAY_LIMIT)
      knownRef.current = new Set(initial.map(t => t.tx_hash))
      setVisible(initial)
      return
    }

    const newTxs = polled.filter(tx => !knownRef.current.has(tx.tx_hash))

    if (newTxs.length === 0) {
      setVisible(prev =>
        prev.map(t => polled.find(p => p.tx_hash === t.tx_hash) ?? t),
      )
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setFreshHashes(new Set())

    // Reduced motion: skip drip, show all at once
    if (reduced) {
      for (const tx of newTxs) knownRef.current.add(tx.tx_hash)
      setVisible(polled.slice(0, DISPLAY_LIMIT))
      return
    }

    queueRef.current = [...newTxs]
    const interval = Math.min(
      MAX_DRIP_MS,
      Math.max(MIN_DRIP_MS, DRIP_BUDGET_MS / newTxs.length),
    )
    timerRef.current = setTimeout(dripNext, interval)

    setVisible(prev =>
      prev.map(t => polled.find(p => p.tx_hash === t.tx_hash) ?? t),
    )
  }, [polled, dripNext, reduced])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  return { visible, freshHashes }
}

function ThroughputBadge() {
  const queryClient = useQueryClient()
  const [tps, setTps] = useState<number | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'chain-status') {
        const data = queryClient.getQueryData<StatusResponse>(['chain-status'])
        if (data?.txn_per_second != null) {
          setTps(Math.round(data.txn_per_second))
        }
      }
    })
    const data = queryClient.getQueryData<StatusResponse>(['chain-status'])
    if (data?.txn_per_second != null) setTps(Math.round(data.txn_per_second))
    return unsubscribe
  }, [queryClient])

  if (tps == null) return null

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] text-muted-foreground/60">
      <span className="h-1 w-1 rounded-full bg-accent/60" />
      {tps} txn/s
    </span>
  )
}

export default function ContinuumHomepage() {
  const { data: rawTxData, isLoading: txLoading } = useContinuumRecentTransactions(DISPLAY_LIMIT)
  const txData = rawTxData as ContinuumRecentTransactionsResponse | undefined
  const polled = useMemo(() => txData?.transactions ?? [], [txData])

  const [reduced, setReduced] = useState(false)
  const { visible: transactions, freshHashes } = useDripFeed(polled, reduced)

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 space-y-8">
      <ChainMetrics />

      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="inline-flex items-center gap-2 font-pixel text-sm uppercase tracking-[0.15em] text-foreground font-medium">
              <ArrowsClockwise weight="duotone" className="w-4 h-4 text-accent" />
              Recent Transactions
            </h2>
            <ThroughputBadge />
          </div>
          <label className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground cursor-pointer">
            <span>Reduce motion</span>
            <Switch
              checked={reduced}
              onCheckedChange={(value) => setReduced(value)}
            />
          </label>
        </div>
        {txLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(6)].map((_, i) => (
              <Card key={i} variant="default" className="p-4 gap-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-32 sm:w-48" />
                  </span>
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </Card>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState message="No transactions found" />
        ) : (
          <div className="relative overflow-x-hidden">
            {!reduced && (
              <>
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-background via-background/60 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </>
            )}
            <div className={`flex flex-col gap-2 ${reduced ? 'py-0' : 'pt-4 pb-8'}`} aria-live="polite">
              {reduced ? (
                transactions.map(tx => (
                  <div key={tx.tx_hash}>
                    <Link to="/sequencing/tx/$transactionId" params={{ transactionId: tx.tx_hash }}>
                      <Card variant="interactive" className="p-4 gap-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2">
                            <Hash weight="bold" className="w-3 h-3 text-muted-foreground" />
                            <HashDisplay hash={tx.tx_hash} />
                          </span>
                          <TimestampDisplay timestamp={tx.timestamp} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Cube weight="bold" className="w-3 h-3" />
                            Tick #{tx.tick_number.toLocaleString()}
                          </span>
                          <Badge variant="muted">Seq #{tx.sequence_number}</Badge>
                        </div>
                      </Card>
                    </Link>
                  </div>
                ))
              ) : (
                <AnimatePresence initial={false} mode="popLayout">
                  {transactions.map(tx => (
                    <motion.div
                      key={tx.tx_hash}
                      layout="position"
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <Link to="/sequencing/tx/$transactionId" params={{ transactionId: tx.tx_hash }}>
                        <Card
                          variant="interactive"
                          className={`p-4 gap-2 border-l-2 transition-[border-color] duration-700 ${freshHashes.has(tx.tx_hash) ? 'border-l-accent' : 'border-l-border'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-2">
                            <Hash weight="bold" className="w-3 h-3 text-muted-foreground" />
                            <HashDisplay hash={tx.tx_hash} />
                          </span>
                            <TimestampDisplay timestamp={tx.timestamp} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Cube weight="bold" className="w-3 h-3" />
                              Tick #{tx.tick_number.toLocaleString()}
                            </span>
                            <Badge variant="muted">Seq #{tx.sequence_number}</Badge>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
