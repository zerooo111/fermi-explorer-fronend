import { useParams } from '@tanstack/react-router'
import { useTransaction } from '../hooks/useTransaction'
import { calculateTrend } from '@/lib/formatters'
import NumberFlow from '@number-flow/react'

export default function TransactionPage() {
  const { transactionId } = useParams({ from: '/transaction/$transactionId' })

  const { data, isLoading, isError, error } = useTransaction(transactionId)

  // Trend calculation for NumberFlow
  const trendCalculator = (oldValue: number, newValue: number) =>
    calculateTrend(oldValue, newValue)

  // Basic validation
  const isValidHash =
    transactionId &&
    transactionId.length === 8 &&
    /^[a-fA-F0-9]+$/.test(transactionId)

  if (!isValidHash) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-red-700 bg-red-950 p-6 rounded-lg">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-red-400 mb-4 uppercase">
              Invalid Transaction Hash
            </h1>
            <p className="text-red-500 font-mono text-sm">
              Transaction hash must be exactly 8 hexadecimal characters.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-4 mb-6">
              <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 uppercase">
                Transaction Details
              </h1>
              <span className="text-sm text-zinc-500 font-mono tracking-wide">
                LOADING...
              </span>
            </div>
            <div className="text-sm text-zinc-500 font-mono tracking-wide py-8 text-center">
              LOADING TRANSACTION DATA...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-red-700 bg-red-950 p-6 rounded-lg">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-red-400 mb-4 uppercase">
              Error Loading Transaction
            </h1>
            <div className="text-sm text-red-500 font-mono">
              ERROR: {error?.message || 'UNKNOWN ERROR'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.transaction) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 mb-4 uppercase">
              Transaction Not Found
            </h1>
            <p className="text-zinc-400 font-mono text-sm">
              No transaction found with hash:{' '}
              <code className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded font-mono">
                {transactionId}
              </code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const transaction = data.transaction

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 uppercase">
              Transaction Details
            </h1>
            <span className="text-sm text-zinc-500 font-mono tracking-wide">
              LIVE DATA
            </span>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium text-zinc-400 font-mono tracking-wider mb-2">
              TRANSACTION HASH
            </div>
            <code className="text-lg font-mono bg-zinc-800 text-zinc-300 px-3 py-2 rounded block break-all">
              {transactionId}
            </code>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4 border-b border-zinc-700 pb-2">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  TICK NUMBER
                </span>
                <span className="text-zinc-100 font-mono font-medium">
                  <NumberFlow
                    value={data.tick_number ?? 0}
                    trend={trendCalculator}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  SEQUENCE NUMBER
                </span>
                <span className="text-zinc-100 font-mono font-medium">
                  <NumberFlow
                    value={data.sequence_number ?? 0}
                    trend={trendCalculator}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  PAYLOAD SIZE
                </span>
                <span className="text-zinc-100 font-mono font-medium">
                  {transaction.payload_size} bytes
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  AGE
                </span>
                <span className="text-zinc-100 font-mono font-medium">
                  {Math.floor(
                    (Date.now() * 1000 - transaction.ingestion_timestamp) /
                      1_000_000,
                  )}
                  s
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4 border-b border-zinc-700 pb-2">
              Timestamps
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider block mb-2">
                  INGESTION TIME
                </span>
                <span className="text-zinc-100 font-mono text-sm">
                  {new Date(
                    transaction.ingestion_timestamp / 1000,
                  ).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider block mb-2">
                  INGESTION TIMESTAMP
                </span>
                <span className="text-zinc-100 font-mono text-sm">
                  <NumberFlow
                    value={transaction.ingestion_timestamp}
                    trend={trendCalculator}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <details className="group">
            <summary className="cursor-pointer text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4 hover:text-zinc-300 transition-colors">
              Raw Data
              <span className="ml-2 text-sm text-zinc-500 font-mono tracking-wide">
                CLICK TO EXPAND
              </span>
            </summary>
            <div className="mt-4 bg-zinc-800 p-4 rounded-lg border border-zinc-600">
              <pre className="text-sm text-zinc-300 overflow-x-auto font-mono">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
