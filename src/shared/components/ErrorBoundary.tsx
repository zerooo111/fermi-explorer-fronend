import React from 'react'

interface ErrorInfo {
  componentStack: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 * and display a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Update state with error info
    this.setState({
      errorInfo,
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
          />
        )
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          retry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default error fallback component
 */
interface DefaultErrorFallbackProps {
  error: Error
  retry: () => void
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  retry,
}) => {
  const isDevelopment = import.meta.env.DEV

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full border border-border bg-card p-8">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-bold font-mono tracking-tight text-foreground uppercase">
              System Error
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground font-mono">
            We encountered an unexpected error. This has been logged and we'll
            investigate.
          </p>
        </div>

        {isDevelopment && (
          <div className="mb-6 p-4 border border-destructive/30 bg-destructive/10">
            <h4 className="text-sm font-medium font-mono text-destructive mb-3 uppercase tracking-wide">
              Error Details (Development):
            </h4>
            <p className="text-xs text-destructive font-mono break-all mb-2">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <details className="mt-3">
                <summary className="text-xs text-destructive cursor-pointer font-mono uppercase tracking-wide">
                  Stack Trace
                </summary>
                <pre className="text-xs text-destructive mt-2 whitespace-pre-wrap font-mono">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={retry}
            className="flex-1 bg-foreground text-background border border-border px-4 py-2 text-sm font-medium font-mono tracking-wide uppercase hover:bg-accent hover:border-border focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-secondary text-foreground border border-border px-4 py-2 text-sm font-medium font-mono tracking-wide uppercase hover:bg-secondary/80 hover:border-border focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for error boundary that provides error handling capabilities
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

/**
 * Async error boundary for handling promise rejections
 */
export const AsyncErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  ...props
}) => {
  const { captureError } = useErrorHandler()

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      captureError(new Error(event.reason))
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [captureError])

  return <ErrorBoundary {...props}>{children}</ErrorBoundary>
}
