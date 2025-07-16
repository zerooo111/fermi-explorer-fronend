import { useTickStream } from '@/hooks'
import { differenceInSeconds } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface LiveTicksProps {
  limit?: number
  showTransactions?: boolean
  className?: string
}

export function LiveTicks({ 
  limit = 20, 
  showTransactions = false,
  className = ''
}: LiveTicksProps) {
  const {
    ticks,
    state,
    error,
    connect,
    disconnect,
    clearTicks,
    isConnected,
    isConnecting,
    reconnectAttempt,
  } = useTickStream({
    maxBufferSize: limit,
    updateQueryCache: true,
  })

  const displayTicks = ticks.slice(0, limit)

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Live Ticks</h3>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 
              isConnecting ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 
               isConnecting ? `Connecting${reconnectAttempt > 0 ? ` (attempt ${reconnectAttempt})` : ''}` : 
               'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isConnected && !isConnecting && (
            <Button
              size="sm"
              variant="outline"
              onClick={connect}
            >
              Connect
            </Button>
          )}
          {(isConnected || isConnecting) && (
            <Button
              size="sm"
              variant="outline"
              onClick={disconnect}
            >
              Disconnect
            </Button>
          )}
          {ticks.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearTicks}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">
            Error: {error.message}
          </p>
        </div>
      )}

      {state === 'connecting' && ticks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Connecting to live tick stream...
          </p>
        </div>
      )}

      {state === 'connected' && ticks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Waiting for new ticks...
          </p>
        </div>
      )}

      {ticks.length > 0 && (
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Tick #</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Batch Hash</TableHead>
                <TableHead className="text-right">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTicks.map((tick) => {
                const tickDate = new Date(tick.timestamp / 1000)
                const secondsAgo = differenceInSeconds(new Date(), tickDate)
                
                return (
                  <TableRow key={tick.tick_number} className="animate-in fade-in-0 slide-in-from-top-1">
                    <TableCell className="font-mono font-medium">
                      #{tick.tick_number}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{tick.transaction_count} transaction{tick.transaction_count !== 1 ? 's' : ''}</div>
                        {showTransactions && tick.transactions.length > 0 && (
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {tick.transactions.slice(0, 3).map((tx) => (
                              <div key={tx.tx_id} className="font-mono">
                                {tx.tx_id.substring(0, 8)}...
                              </div>
                            ))}
                            {tick.transactions.length > 3 && (
                              <div>+{tick.transactions.length - 3} more</div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tick.transaction_batch_hash.substring(0, 16)}...
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {secondsAgo < 60 
                        ? `${secondsAgo}s ago`
                        : `${Math.floor(secondsAgo / 60)}m ago`
                      }
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      {ticks.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {displayTicks.length} of {ticks.length} ticks
        </div>
      )}
    </div>
  )
}