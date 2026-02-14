import { useParams, Link } from '@tanstack/react-router'
import { useContinuumTransaction } from '@/features/continuum/api/hooks'
import type { ContinuumTransaction } from '@/shared/types/shared/api'
import { TransactionDetail } from '@/features/continuum/components/v2/transactions'
import {
  Alert, AlertDescription, PageSkeleton, TableSkeleton, Button,
} from '@/shared/components/ui'
import { EmptyState } from '@/features/continuum/components/v2/shared'

export default function TransactionDetailPage() {
  const { transactionId } = useParams({ from: '/sequencing/tx/$transactionId' })
  const { data: rawTx, isLoading, isError, error } = useContinuumTransaction(transactionId)
  const tx = rawTx as ContinuumTransaction | undefined

  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-3/4">
        <TableSkeleton rows={10} />
      </PageSkeleton>
    )
  }

  if (isError) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <Alert variant="error">
          <AlertDescription>
            Error loading transaction: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
        <Link to="/sequencing" className="mt-4 inline-block">
          <Button variant="default">Return to home</Button>
        </Link>
      </div>
    )
  }

  if (!tx?.tx_hash) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <EmptyState message="Transaction not found" description="The requested transaction does not exist." />
        <div className="flex justify-center mt-4">
          <Link to="/sequencing"><Button variant="default">Return to home</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      <TransactionDetail transaction={tx} />
      <div className="mt-8">
        <Link to="/sequencing">
          <Button variant="default">Return to home</Button>
        </Link>
      </div>
    </div>
  )
}
