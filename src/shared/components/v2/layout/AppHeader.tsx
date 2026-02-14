/**
 * Enhanced Application Header V2
 *
 * Features:
 * - Logo and title with staging badge
 * - Sequencing/Execution tabs
 * - Network status indicator
 * - Quick search
 * - Theme switcher
 * - Settings menu
 */

import { Link, useLocation } from '@tanstack/react-router'
import { useHealth } from '@/shared/hooks/useHealth'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/components/ui/badge'
import { Logo } from '@/shared/components/Logo'

/**
 * Network status indicator component
 */
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

  return (
    <Badge
      variant={
        isError ? 'destructive' : isConnecting ? 'warning' : isHealthy ? 'success' : 'muted'
      }
    >
      <span className="size-2 rounded-full" />
      {getStatus()}
    </Badge>
  )
}

/**
 * Explorer tabs for Sequencing/Execution navigation
 */
const ExplorerTabs = () => {
  const location = useLocation()
  const isSequencingActive = location.pathname.startsWith('/sequencing')
  const isExecutionActive = location.pathname.startsWith('/execution')

  return (
    <div className="h-8 flex items-center border border-border rounded-md bg-card">
      <Link
        to="/sequencing"
        className={cn(
          'px-3 h-[30px] flex items-center text-xs sm:text-sm font-mono transition-colors rounded',
          isSequencingActive
            ? 'bg-secondary text-emerald-400 font-semibold'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Sequencing
      </Link>
      <Link
        to="/execution"
        className={cn(
          'px-3 h-[30px] flex items-center text-xs sm:text-sm font-mono transition-colors rounded',
          isExecutionActive
            ? 'bg-secondary text-blue-400 font-semibold'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Execution
      </Link>
    </div>
  )
}

export default function AppHeader() {
  const { data, isLoading: isConnecting, isError } = useHealth()
  const location = useLocation()
  const isHealthy = data?.status === 'healthy'

  const isExecutionActive = location.pathname.startsWith('/execution')
  const explorerColor = isExecutionActive ? 'text-blue-500' : 'text-emerald-500'

  return (
    <header className="border-b border-border bg-background py-2 sticky top-0 z-50">
      <nav className="px-4 sm:px-6 container flex items-center justify-between mx-auto max-w-screen-xl gap-4">
        {/* Logo and Title */}
        <Link
          to="/sequencing"
          className="text-lg sm:text-xl flex items-center font-medium tracking-tight text-foreground flex-shrink-0"
        >
          <Logo className="h-6 pr-1 text-foreground" />
          <span className="hidden sm:inline">Continuum</span>
          <span className={cn('font-light ml-1', explorerColor)}>Explorer</span>
          <span className="bg-teal-400 ml-2 font-bold text-zinc-950 text-xs sm:text-sm tracking-wide px-1.5 py-0.5 rounded">
            STAGING
          </span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ExplorerTabs />
          <StatusIndicator
            isHealthy={isHealthy}
            isConnecting={isConnecting}
            isError={isError}
          />
        </div>
      </nav>
    </header>
  )
}
