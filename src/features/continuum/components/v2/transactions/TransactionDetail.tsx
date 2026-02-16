import { memo, useState, useMemo, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import type { ContinuumTransaction, OrderIntent } from '@/shared/types/shared/api'
import {
  Card, Tabs, TabsList, TabsTrigger, TabsContent,
  Separator, Badge,
} from '@/shared/components/ui'
import { HashDisplay, TimestampDisplay, Breadcrumbs } from '../shared'
import {
  Receipt, FileText, Cube, Tag,
} from '@phosphor-icons/react'

function decodeBase64(base64: string): string {
  try {
    return atob(base64)
  } catch {
    return base64
  }
}

function tryParseJson(str: string): object | null {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

function parsePayload(payload: string): { decoded: string; json: object | null; protocol: string | null } {
  const decoded = decodeBase64(payload)
  const colonIndex = decoded.indexOf(':')
  if (colonIndex > 0 && colonIndex < 20) {
    const protocol = decoded.slice(0, colonIndex)
    const jsonPart = decoded.slice(colonIndex + 1)
    const json = tryParseJson(jsonPart)
    return { decoded, json, protocol }
  }
  const json = tryParseJson(decoded)
  return { decoded, json, protocol: null }
}

function base64ToHex(base64: string): string {
  try {
    const binary = atob(base64)
    return Array.from(binary, (char) =>
      char.charCodeAt(0).toString(16).padStart(2, '0')
    ).join('')
  } catch {
    return base64
  }
}

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

function IntentDisplay({ intent }: { intent: OrderIntent }) {
  const isBuy = intent.side === 'buy'
  return (
    <div className="grid grid-cols-2 gap-2 px-3 py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">Side</span>
        <Badge variant={isBuy ? 'success' : 'destructive'}>
          <Tag weight="duotone" className="w-3 h-3" />
          {intent.side}
        </Badge>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">Price</span>
        <span className="font-mono text-xs">{intent.price}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">Quantity</span>
        <span className="font-mono text-xs">{intent.quantity}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">Order ID</span>
        <span className="font-mono text-xs">{intent.order_id}</span>
      </div>
      <div className="col-span-2 flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">Base Mint</span>
        <code className="font-mono text-xs break-all">{intent.base_mint}</code>
      </div>
      <div className="col-span-2 flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">Quote Mint</span>
        <code className="font-mono text-xs break-all">{intent.quote_mint}</code>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">Owner</span>
        <code className="font-mono text-xs break-all">{intent.owner}</code>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">Expiry</span>
        <span className="font-mono text-xs">{intent.expiry}</span>
      </div>
    </div>
  )
}

interface TransactionDetailProps {
  transaction: ContinuumTransaction
}

export const TransactionDetail = memo(function TransactionDetail({
  transaction: tx,
}: TransactionDetailProps) {
  const [payloadTab, setPayloadTab] = useState<'decoded' | 'raw'>('decoded')
  const handleTabChange = useCallback((tab: 'decoded' | 'raw') => setPayloadTab(tab), [])

  const payload = useMemo(() => parsePayload(tx.payload), [tx.payload])
  const decoded = tx.payload_decoded

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[
        { label: 'Sequencing', href: '/sequencing' },
        { label: `Tx ${tx.tx_hash}` },
      ]} />

      <h1 className="flex items-center gap-2 font-pixel text-lg text-accent">
        <Receipt weight="duotone" className="w-5 h-5 text-accent" />
        Transaction Details
      </h1>

      {/* All transaction details in one card */}
      <Card variant="default" className="p-0 gap-0">
        <DetailRow label="Hash">
          <HashDisplay hash={tx.tx_hash} />
        </DetailRow>
        <Separator />
        <DetailRow label="Timestamp">
          <TimestampDisplay timestamp={tx.timestamp} />
        </DetailRow>
        <Separator />
        <DetailRow label="Tick">
          <Link
            to="/sequencing/tick/$tickId"
            params={{ tickId: String(tx.tick_number) }}
            className="inline-flex items-center gap-1.5 hover:underline hover:text-foreground"
          >
            <Cube weight="duotone" className="w-3 h-3 text-accent" />
            #{tx.tick_number.toLocaleString()}
          </Link>
        </DetailRow>
        <Separator />
        <DetailRow label="Sequence">
          {tx.sequence_number}
        </DetailRow>
        <Separator />
        <DetailRow label="Nonce">
          {tx.nonce}
        </DetailRow>
        <Separator />
        <DetailRow label="Transaction ID">
          <code className="break-all">{tx.tx_id}</code>
        </DetailRow>
        {tx.public_key && (
          <>
            <Separator />
            <DetailRow label="Public Key">
              <code className="break-all">{base64ToHex(tx.public_key)}</code>
            </DetailRow>
          </>
        )}
        <Separator />
        <DetailRow label="Signature">
          <code className="break-all">{base64ToHex(tx.signature)}</code>
        </DetailRow>
      </Card>

      {/* Payload */}
      <section>
        <h2 className="flex items-center gap-2 font-pixel text-lg text-accent mb-3">
          <FileText weight="duotone" className="w-5 h-5 text-accent" />
          Payload
        </h2>

        {decoded && (
          <Card variant="default" className="p-0 gap-0 mb-3">
            <div className="flex items-center gap-2 px-3 py-2">
              <Badge variant="muted">{decoded.protocol}</Badge>
              <Badge variant="default">{decoded.data.type}</Badge>
              {decoded.data.version && (
                <span className="text-[10px] font-mono text-muted-foreground">v{decoded.data.version}</span>
              )}
            </div>
            {decoded.data.intent && (
              <>
                <Separator />
                <IntentDisplay intent={decoded.data.intent} />
              </>
            )}
            {Object.entries(decoded.data)
              .filter(([key]) => !['intent', 'type', 'version'].includes(key))
              .length > 0 && (
              <>
                <Separator />
                <div className="px-3 py-2 space-y-1.5">
                  {Object.entries(decoded.data)
                    .filter(([key]) => !['intent', 'type', 'version'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-muted-foreground">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <code className="font-mono text-xs break-all text-foreground">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </code>
                      </div>
                    ))}
                </div>
              </>
            )}
          </Card>
        )}

        <Tabs value={payloadTab} onValueChange={(val) => handleTabChange(val as 'decoded' | 'raw')}>
          <TabsList variant="card">
            <TabsTrigger variant="card" value="decoded">
              Decoded
            </TabsTrigger>
            <TabsTrigger variant="card" value="raw">
              Raw (Base64)
            </TabsTrigger>
          </TabsList>

          <TabsContent variant="card" value="decoded">
            {payload.json ? (
              <Card variant="default" className="p-0 gap-0">
                {payload.protocol && (
                  <div className="text-xs text-muted-foreground px-3 pt-2 font-mono">
                    Protocol: {payload.protocol}
                  </div>
                )}
                <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground px-3 py-2 [counter-reset:line] leading-5">
                  {JSON.stringify(payload.json, null, 2).split('\n').map((line, i) => (
                    <span key={i} className="block pl-8 -indent-8 before:inline-block before:w-6 before:text-right before:pr-2 before:text-muted-foreground/40 before:text-[10px] before:[counter-increment:line] before:content-[counter(line)]">
                      {line}
                    </span>
                  ))}
                </pre>
              </Card>
            ) : (
              <Card variant="default" className="p-3 gap-0">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground">
                  {payload.decoded}
                </pre>
              </Card>
            )}
          </TabsContent>

          <TabsContent variant="card" value="raw">
            <Card variant="default" className="p-3 gap-0">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-muted-foreground">
                {tx.payload}
              </pre>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
})
