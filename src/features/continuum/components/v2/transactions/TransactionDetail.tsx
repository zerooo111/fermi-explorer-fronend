import { memo, useState, useMemo, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import type { ContinuumTransaction } from '@/shared/types/shared/api'
import {
  Table, TableBody, TableCell, TableRow,
  Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/shared/components/ui'
import { HashDisplay, TimestampDisplay, StatusBadge, Breadcrumbs } from '../shared'

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

interface TransactionDetailProps {
  transaction: ContinuumTransaction
}

export const TransactionDetail = memo(function TransactionDetail({
  transaction: tx,
}: TransactionDetailProps) {
  const [payloadTab, setPayloadTab] = useState<'decoded' | 'raw'>('decoded')
  const handleTabChange = useCallback((tab: 'decoded' | 'raw') => setPayloadTab(tab), [])

  const payload = useMemo(() => parsePayload(tx.payload), [tx.payload])

  const rows = useMemo(() => [
    { label: 'Transaction Hash', value: <HashDisplay hash={tx.tx_hash} /> },
    { label: 'Transaction ID', value: <code className="font-mono text-xs break-all">{tx.tx_id}</code> },
    { label: 'Status', value: <StatusBadge status={tx.status} /> },
    { label: 'Sequence Number', value: <span className="font-mono text-xs">{tx.sequence_number}</span> },
    {
      label: 'Tick Number',
      value: (
        <Link
          to="/sequencing/tick/$tickId"
          params={{ tickId: String(tx.tick_number) }}
          className="font-mono text-xs hover:underline hover:text-foreground"
        >
          #{tx.tick_number.toLocaleString()}
        </Link>
      ),
    },
    { label: 'Nonce', value: <span className="font-mono text-xs">{tx.nonce}</span> },
    { label: 'Timestamp', value: <TimestampDisplay timestamp={tx.timestamp} /> },
    ...(tx.public_key ? [{ label: 'Public Key', value: <code className="font-mono text-xs break-all">{base64ToHex(tx.public_key)}</code> }] : []),
    { label: 'Signature', value: <code className="font-mono text-xs break-all">{base64ToHex(tx.signature)}</code> },
  ], [tx])

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Sequencing', href: '/sequencing' },
        { label: `Tx ${tx.tx_hash.slice(0, 8)}...` },
      ]} />

      <h1 className="text-lg sm:text-xl font-bold text-foreground break-all">
        Transaction Detail
      </h1>

      {/* Info table */}
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

      {/* Payload section */}
      <div>
        <Tabs>
          <TabsList>
            <TabsTrigger
              data-selected={payloadTab === 'decoded' ? '' : undefined}
              onClick={() => handleTabChange('decoded')}
            >
              Decoded Payload
            </TabsTrigger>
            <TabsTrigger
              data-selected={payloadTab === 'raw' ? '' : undefined}
              onClick={() => handleTabChange('raw')}
            >
              Raw (Base64)
            </TabsTrigger>
          </TabsList>

          <TabsContent className={payloadTab === 'decoded' ? '' : 'hidden'}>
            {payload.json ? (
              <Card variant="default">
                <CardContent>
                  {payload.protocol && (
                    <div className="text-xs text-muted-foreground mb-2 font-mono">
                      Protocol: {payload.protocol}
                    </div>
                  )}
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground">
                    {JSON.stringify(payload.json, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <Card variant="default">
                <CardContent>
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground">
                    {payload.decoded}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent className={payloadTab === 'raw' ? '' : 'hidden'}>
            <Card variant="default">
              <CardContent>
                <pre className="text-xs font-mono whitespace-pre-wrap break-words text-muted-foreground">
                  {tx.payload}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
})
