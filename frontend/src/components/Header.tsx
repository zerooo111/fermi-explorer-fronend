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
    if (isError) return 'Disconnected'
    if (isConnecting) return 'Connecting...'
    if (isHealthy) return 'Connected'
    return 'Unknown'
  }

  const getStatusColor = () => {
    if (isError) return 'bg-red-500'
    if (isConnecting) return 'bg-yellow-500'
    if (isHealthy) return 'bg-green-500'
    return 'bg-gray-300'
  }

  return (
    <div
      className={cn(
        'font-medium  flex items-center gap-2 border py-1.5 px-3 border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer',
      )}
    >
      <span className={cn('size-2', getStatusColor())} />
      {getStatus()}
    </div>
  )
}

export default function Header() {
  const {
    isHealthy,
    isLoading: isConnecting,
    isError,
  } = useHealth({
    enablePolling: true,
    pollingInterval: 5000,
  })

  return (
    <header className="border-b border-gray-300 h-14 flex items-center">
      <nav className="px-4 container flex items-center justify-between mx-auto max-w-screen-lg">
        <div className="text-xl font-extrabold">
          <span> FERMI </span>
          <span className="font-light italic">Explorer</span>
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
