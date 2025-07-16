import { useParams } from '@tanstack/react-router'
import { useTransaction } from '../hooks/useTransaction'

export default function TransactionPage() {
  const { txHash } = useParams({ from: '/tx/$txHash' })
  
  const { 
    result, 
    isLoading, 
    isError, 
    error, 
    isValidHash, 
    notFound 
  } = useTransaction(txHash, {
    enhanceData: true,
    validateHash: true
  })

  if (!isValidHash) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Invalid Transaction Hash</h1>
        <p className="text-gray-600">
          Transaction hash must be exactly 8 hexadecimal characters.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Loading Transaction...</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Error Loading Transaction</h1>
        <p className="text-red-600">
          {error?.message || 'Failed to load transaction data'}
        </p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Transaction Not Found</h1>
        <p className="text-gray-600">
          No transaction found with hash: <code className="bg-gray-100 px-2 py-1 rounded">{txHash}</code>
        </p>
      </div>
    )
  }

  const { raw, enhanced, properties } = result

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Transaction Details</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Transaction Hash</h2>
        <code className="text-lg font-mono bg-gray-100 px-3 py-2 rounded block">
          {result.hash}
        </code>
      </div>

      {raw && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Tick Number:</span>
                <span className="ml-2">{raw.transaction.tick_number}</span>
              </div>
              <div>
                <span className="font-medium">Sequence Number:</span>
                <span className="ml-2">{raw.transaction.sequence_number}</span>
              </div>
              <div>
                <span className="font-medium">Payload Size:</span>
                <span className="ml-2">{properties.sizeFormatted}</span>
              </div>
              <div>
                <span className="font-medium">Age:</span>
                <span className="ml-2">{properties.ageInSeconds}s</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Timestamps</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Ingestion Time:</span>
                <span className="ml-2">{properties.formattedTimestamp}</span>
              </div>
              <div>
                <span className="font-medium">Ingestion Timestamp:</span>
                <span className="ml-2 font-mono text-sm">{raw.transaction.ingestion_timestamp}</span>
              </div>
            </div>
          </div>

          {enhanced && (
            <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Enhanced Data</h2>
              <div className="space-y-3">
                {properties.decodedTxId && (
                  <div>
                    <span className="font-medium">Decoded Transaction ID:</span>
                    <span className="ml-2 font-mono">{properties.decodedTxId}</span>
                  </div>
                )}
                {enhanced.ingestion_time && (
                  <div>
                    <span className="font-medium">Ingestion Time (Enhanced):</span>
                    <span className="ml-2">{enhanced.ingestion_time.formatted}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(raw, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
