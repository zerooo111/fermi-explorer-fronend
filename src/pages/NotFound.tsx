import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to homepage after a short delay
    const redirectTimer = setTimeout(() => {
      navigate({ to: '/continuum' })
    }, 5000)

    return () => clearTimeout(redirectTimer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="text-center border border-zinc-700 bg-zinc-950 p-8 max-w-md  w-full">
        <h1 className="text-6xl font-bold font-mono text-red-400 mb-6">404</h1>
        <h2 className="text-2xl font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-zinc-400 font-mono mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-zinc-500 font-mono tracking-wide">
            REDIRECTING TO HOMEPAGE IN 5 SECONDS...
          </p>
          <div className="w-full bg-zinc-800 h-1">
            <div className="bg-zinc-400 h-1 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
