import { useParams, Link } from '@tanstack/react-router'
import NumberFlow from '@number-flow/react'
import { useTick } from '@/hooks/useTick'
import { calculateTrend } from '@/lib/formatters'
import {
  calculateAgeFromMicroseconds,
  microsecondsToMilliseconds,
  toBN,
  toSafeNumber,
} from '@/lib/bigNumbers'

export default function TickPage() {
  const { tickId } = useParams({ from: '/tick/$tickId' })

  // Convert tickId to number
  const tickNumber = parseInt(tickId, 10)

  // Use the simplified useTick hook
  const { data, isLoading, isError, error } = useTick(tickNumber)

  const isValidTickNumber = !isNaN(tickNumber) && tickNumber > 0

  // Trend calculation for NumberFlow
  const trendCalculator = (oldValue: number, newValue: number) =>
    calculateTrend(oldValue, newValue)

  // Handle invalid tick number
  if (!isValidTickNumber) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-red-700 bg-red-950 p-6 rounded-lg">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-red-400 mb-4 uppercase">
              Invalid Tick Number
            </h1>
            <p className="text-red-500 font-mono text-sm mb-4">
              "{tickId}" is not a valid tick number. Tick numbers must be
              positive integers.
            </p>
            <Link
              to="/"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-mono text-sm uppercase tracking-wide"
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
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-4 mb-6">
              <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 uppercase">
                Tick Details
              </h1>
              <span className="text-sm text-zinc-500 font-mono tracking-wide">
                LOADING...
              </span>
            </div>
            <div className="text-sm text-zinc-500 font-mono tracking-wide py-8 text-center">
              LOADING TICK DATA...
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-red-700 bg-red-950 p-6 rounded-lg">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-red-400 mb-4 uppercase">
              Error Loading Tick
            </h1>
            <p className="text-red-500 font-mono text-sm mb-4">
              ERROR: {error?.message || 'UNKNOWN ERROR'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-mono text-sm uppercase tracking-wide"
              >
                Retry
              </button>
              <Link
                to="/"
                className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors font-mono text-sm uppercase tracking-wide"
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
  if (!data || !data.tick) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 mb-4 uppercase">
              Tick Not Found
            </h1>
            <p className="text-zinc-400 font-mono text-sm mb-4">
              Tick #{tickNumber} was not found in the sequencer data. This could
              mean:
            </p>
            <ul className="text-zinc-400 font-mono text-sm list-disc list-inside space-y-1 mb-4">
              <li>The tick number is higher than the current chain height</li>
              <li>The tick data is not yet available</li>
              <li>There was an issue with the sequencer</li>
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors font-mono text-sm uppercase tracking-wide"
              >
                Retry
              </button>
              <Link
                to="/"
                className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors font-mono text-sm uppercase tracking-wide"
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
  const tick = data.tick

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
          <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 uppercase">
                Tick #
                <NumberFlow
                  value={toSafeNumber(toBN(tick.tick_number))}
                  trend={trendCalculator}
                />
              </h1>
              <p className="text-zinc-400 font-mono text-sm mt-1">
                {new Date(
                  microsecondsToMilliseconds(tick.timestamp),
                ).toLocaleString()}
              </p>
            </div>
            <span className="text-sm text-zinc-500 font-mono tracking-wide bg-zinc-800 px-3 py-1 rounded">
              LIVE DATA
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <Link
              to="/tick/$tickId"
              params={{ tickId: String(tick.tick_number - 1) }}
              className="flex items-center gap-2 bg-zinc-800 border border-zinc-600 px-4 py-2 rounded hover:bg-zinc-700 transition-colors text-zinc-300 font-mono text-sm"
            >
              <span>←</span>
              PREVIOUS TICK
            </Link>

            <div className="text-sm text-zinc-500 font-mono tracking-wide">
              TICK #{tickNumber}
            </div>

            <Link
              to="/tick/$tickId"
              params={{ tickId: String(tick.tick_number + 1) }}
              className="flex items-center gap-2 bg-zinc-800 border border-zinc-600 px-4 py-2 rounded hover:bg-zinc-700 transition-colors text-zinc-300 font-mono text-sm"
            >
              NEXT TICK
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
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
                    value={toSafeNumber(toBN(tick.tick_number))}
                    trend={trendCalculator}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  TIMESTAMP
                </span>
                <span className="text-zinc-100 font-mono text-sm">
                  <NumberFlow
                    value={toSafeNumber(toBN(tick.timestamp))}
                    trend={trendCalculator}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  AGE
                </span>
                <span className="text-zinc-100 font-mono font-medium">
                  {calculateAgeFromMicroseconds(tick.timestamp)}s ago
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  TRANSACTION COUNT
                </span>
                <span className="text-zinc-100 font-mono font-medium">
                  <NumberFlow
                    value={toSafeNumber(toBN(tick.transaction_count))}
                    trend={trendCalculator}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  VDF ITERATIONS
                </span>
                <span className="text-zinc-100 font-mono font-medium">
                  <NumberFlow
                    value={toSafeNumber(toBN(tick.vdf_iterations))}
                    trend={trendCalculator}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4 border-b border-zinc-700 pb-2">
              Technical Details
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider block mb-2">
                  TRANSACTION BATCH HASH
                </span>
                <span className="text-zinc-100 font-mono text-sm bg-zinc-800 px-2 py-1 rounded break-all block">
                  {tick.transaction_batch_hash}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider block mb-2">
                  PREVIOUS OUTPUT
                </span>
                <span className="text-zinc-100 font-mono text-sm bg-zinc-800 px-2 py-1 rounded break-all block">
                  {tick.previous_output}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4 border-b border-zinc-700 pb-2">
              Performance Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wider">
                  DATA SOURCE
                </span>
                <span className="text-zinc-100 font-mono font-medium">API</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
            <h2 className="text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4 border-b border-zinc-700 pb-2">
              Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors font-mono text-sm uppercase tracking-wide"
              >
                Refresh Data
              </button>
              <button
                onClick={() => {
                  const url = window.location.href
                  navigator.clipboard.writeText(url)
                  alert('URL copied to clipboard!')
                }}
                className="w-full bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors font-mono text-sm uppercase tracking-wide"
              >
                Copy URL
              </button>
              <Link
                to="/tick/$tickId"
                params={{ tickId: String(Math.max(1, tick.tick_number - 10)) }}
                className="block w-full text-center bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors font-mono text-sm uppercase tracking-wide"
              >
                Go to Tick -10
              </Link>
              <Link
                to="/tick/$tickId"
                params={{ tickId: String(tick.tick_number + 10) }}
                className="block w-full text-center bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors font-mono text-sm uppercase tracking-wide"
              >
                Go to Tick +10
              </Link>
            </div>
          </div>
        </div>

        {/* Raw Data (Collapsible) */}
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
