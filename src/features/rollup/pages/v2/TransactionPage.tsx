import { useParams, Link } from '@tanstack/react-router'
import { useTransaction } from '@/features/rollup/api/hooks'
import type { Transaction } from '@/features/rollup/types/api'
import { Breadcrumbs, HashDisplay, EmptyState } from '@/features/continuum/components/v2/shared'
import {
  Alert, AlertDescription, PageSkeleton, TableSkeleton,
  Card, CardContent, Badge, Button,
  Table, TableBody, TableCell, TableRow,
} from '@/shared/components/ui'

export default function TransactionPage() {
  const { id } = useParams({ from: '/execution/transactions/$id' })
  const { data: rawTx, isLoading, error } = useTransaction(id)
  const tx = rawTx as Transaction | undefined

  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-3/4">
        <TableSkeleton rows={10} />
      </PageSkeleton>
    )
  }

  if (error) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <Alert variant="error">
          <AlertDescription>Error: {(error as Error).message}</AlertDescription>
        </Alert>
        <Link to="/execution" className="mt-4 inline-block">
          <Button variant="default">Return to home</Button>
        </Link>
      </div>
    )
  }

  if (!tx) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <EmptyState message="Transaction not found" />
        <div className="flex justify-center mt-4">
          <Link to="/execution"><Button variant="default">Return to home</Button></Link>
        </div>
      </div>
    )
  }

  const rows = [
    { label: 'Transaction ID', value: <code className="font-mono text-xs break-all">{tx.id}</code> },
    { label: 'Type', value: <Badge variant={tx.kind === 'order' ? 'success' : 'warning'}>{tx.kind}</Badge> },
    {
      label: 'Block',
      value: (
        <Link to="/execution/blocks/$height" params={{ height: String(tx.block_height) }} className="font-mono text-xs hover:underline">
          #{tx.block_height.toLocaleString()}
        </Link>
      ),
    },
    { label: 'Batch Index', value: <span className="font-mono text-xs">{tx.batch_index}</span> },
    { label: 'Side', value: <span className="font-mono text-xs">{tx.side}</span> },
    ...(tx.market_name ? [{ label: 'Market', value: <span className="font-mono text-xs">{tx.market_name}</span> }] : []),
    { label: 'Price', value: <span className="font-mono text-xs">{tx.price}</span> },
    { label: 'Quantity', value: <span className="font-mono text-xs">{tx.quantity}</span> },
    { label: 'Owner', value: <HashDisplay hash={tx.owner} prefixLength={8} suffixLength={8} /> },
    { label: 'Signature', value: <HashDisplay hash={tx.signature} prefixLength={8} suffixLength={8} /> },
  ]

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Breadcrumbs items={[
        { label: 'Execution', href: '/execution' },
        { label: `Transaction ${tx.id.slice(0, 12)}...` },
      ]} />

      <h1 className="text-lg sm:text-xl font-bold text-foreground">Transaction Detail</h1>

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
        <Link to="/execution">
          <Button variant="default">Return to home</Button>
        </Link>
      </div>
    </div>
  )
}
