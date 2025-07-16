import { useParams, Link } from '@tanstack/react-router'
import { useTick } from '@/hooks/useTick'
import { formatBytes } from '@/api/types'

export default function TickPage() {
  const { tickId } = useParams({ from: '/tick/$tickId' })
  
  // Convert tickId to number
  const tickNumber = parseInt(tickId, 10)
  
  // Use the useTick hook with enhanced data
  const { 
    result, 
    isLoading, 
    isError, 
    error, 
    isValidTickNumber,
    source,
    responseTime 
  } = useTick(tickNumber, {
    enhanceData: true,
    validateTickNumber: true,
    onTickFound: (tick) => {
      console.log('Tick found:', tick)
    },
    onTickNotFound: (num) => {
      console.log('Tick not found:', num)
    }
  })

  // Handle invalid tick number
  if (!isValidTickNumber) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-800 mb-2">Invalid Tick Number</h1>
            <p className="text-red-700">
              "{tickId}" is not a valid tick number. Tick numbers must be positive integers.
            </p>
            <Link 
              to="/" 
              className="inline-block mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-800 mb-2">Error Loading Tick</h1>
            <p className="text-red-700 mb-4">
              {error?.message || 'An unexpected error occurred while loading the tick data.'}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
              <Link 
                to="/" 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle tick not found
  if (!result.found) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-yellow-800 mb-2">Tick Not Found</h1>
            <p className="text-yellow-700 mb-4">
              Tick #{tickNumber} was not found in the sequencer data. This could mean:
            </p>
            <ul className="text-yellow-700 list-disc list-inside space-y-1 mb-4">
              <li>The tick number is higher than the current chain height</li>
              <li>The tick data is not yet available</li>
              <li>There was an issue with the sequencer</li>
            </ul>
            <div className="flex gap-2">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
              >
                Retry
              </button>
              <Link 
                to="/" 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main content - tick found
  const tick = result.raw!.tick!
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tick #{tick.tick_number.toLocaleString()}
            </h1>
            <p className="text-gray-600 mt-1">
              {result.properties.formattedTimestamp} ({result.properties.relativeTime})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              result.properties.isRecent 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {result.properties.isRecent ? 'Recent' : 'Archived'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              source === 'memory' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {source === 'memory' ? 'Memory' : 'Archive'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-lg">
          <Link 
            to="/tick/$tickId" 
            params={{ tickId: String(tick.tick_number - 1) }}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={tick.tick_number <= 1}
          >
            <span>←</span>
            Previous Tick
          </Link>
          
          <div className="text-sm text-gray-600">
            {responseTime && (
              <span>Loaded in {responseTime}ms</span>
            )}
          </div>
          
          <Link 
            to="/tick/$tickId" 
            params={{ tickId: String(tick.tick_number + 1) }}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            Next Tick
            <span>→</span>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tick Number:</span>
                <span className="font-mono font-medium">{tick.tick_number.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-mono text-sm">{tick.timestamp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{result.properties.relativeTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Count:</span>
                <span className="font-medium">{tick.transaction_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VDF Iterations:</span>
                <span className="font-mono font-medium">{tick.vdf_iterations.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 block mb-1">Transaction Batch Hash:</span>
                <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded break-all">
                  {tick.transaction_batch_hash}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Previous Output:</span>
                <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded break-all">
                  {tick.previous_output}
                </span>
              </div>
              {result.properties.averageTransactionSize && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg TX Size:</span>
                  <span className="font-medium">
                    {formatBytes(result.properties.averageTransactionSize)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Data Source:</span>
                <span className={`font-medium ${
                  source === 'memory' ? 'text-blue-600' : 'text-purple-600'
                }`}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </span>
              </div>
              {responseTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">{responseTime}ms</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Age Category:</span>
                <span className={`font-medium ${
                  result.properties.isRecent ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {result.properties.isRecent ? 'Recent' : 'Historical'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age in Seconds:</span>
                <span className="font-mono font-medium">
                  {result.properties.ageInSeconds?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
              <button 
                onClick={() => {
                  const url = window.location.href
                  navigator.clipboard.writeText(url)
                  alert('URL copied to clipboard!')
                }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Copy URL
              </button>
              <Link 
                to="/tick/$tickId" 
                params={{ tickId: String(Math.max(1, tick.tick_number - 10)) }}
                className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Go to Tick -10
              </Link>
              <Link 
                to="/tick/$tickId" 
                params={{ tickId: String(tick.tick_number + 10) }}
                className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Go to Tick +10
              </Link>
            </div>
          </div>
        </div>

        {/* Raw Data (Collapsible) */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <details className="group">
            <summary className="cursor-pointer text-xl font-semibold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
              Raw Data
              <span className="ml-2 text-sm text-gray-500">Click to expand</span>
            </summary>
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(result.raw, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
