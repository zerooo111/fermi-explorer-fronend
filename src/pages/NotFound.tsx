import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          navigate({ to: '/sequencing' })
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [navigate])

  const handleNavigate = () => {
    navigate({ to: '/sequencing' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="text-center p-8 max-w-md w-full">
        <h1 className="text-6xl font-bold font-mono text-destructive mb-6">404</h1>
        <h2 className="text-2xl font-bold font-mono tracking-tight text-foreground uppercase mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground font-mono mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4 mb-6">
          <p className="text-sm text-muted-foreground font-mono tracking-wide">
            REDIRECTING IN {countdown}S...
          </p>
          <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
            <div
              className="bg-accent h-1 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
        </div>
        <Button onClick={handleNavigate} variant="default" className="w-full">
          Go Home Now
        </Button>
      </Card>
    </div>
  )
}
