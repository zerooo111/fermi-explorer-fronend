import { useHealth } from '@/hooks'
import { cn } from '@/lib/utils'

const StatusIndicator = ({
  isHealthy,
  isConnecting,
  isError,
}: {
  isHealthy: boolean
  isConnecting: boolean
  isError: boolean
}) => {
  const getStatus = () => {
    if (isError) return 'DISCONNECTED'
    if (isConnecting) return 'CONNECTING...'
    if (isHealthy) return 'CONNECTED'
    return 'UNKNOWN'
  }

  const getStatusColor = () => {
    if (isError) return 'bg-red-500 border-red-400'
    if (isConnecting) return 'bg-yellow-500 border-yellow-400'
    if (isHealthy) return 'bg-green-500 border-green-400'
    return 'bg-zinc-500 border-zinc-400'
  }

  const getTextColor = () => {
    if (isError) return 'text-red-400'
    if (isConnecting) return 'text-yellow-400'
    if (isHealthy) return 'text-green-400'
    return 'text-zinc-400'
  }

  return (
    <div
      className={cn(
        'font-mono font-medium flex items-center gap-2 sm:gap-3 border border-zinc-700 py-1.5 sm:py-2 px-2 sm:px-4 bg-zinc-950 hover:bg-zinc-900 transition-colors duration-200 cursor-pointer text-xs sm:text-sm',
      )}
    >
      <span className={cn('size-2 border', getStatusColor())} />
      <span className={cn('tracking-wider', getTextColor())}>
        {getStatus()}
      </span>
    </div>
  )
}

export default function Header() {
  const {
    data,
    isLoading: isConnecting,
    isError,
  } = useHealth()

  const isHealthy = data?.status === 'healthy'

  return (
    <header className="border-b border-zinc-700 h-14 sm:h-16 flex items-center bg-zinc-950">
      <nav className="px-4 sm:px-6 container flex items-center justify-between mx-auto max-w-screen-xl">
        <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-zinc-100">
          <span className="text-zinc-100">FERMI</span>
          <span className="text-zinc-500 font-light italic ml-1 sm:ml-2 text-sm sm:text-base">Explorer</span>
        </div>
        <StatusIndicator
          isHealthy={isHealthy}
          isConnecting={isConnecting}
          isError={isError}
        />
      </nav>
    </header>
  )
}
