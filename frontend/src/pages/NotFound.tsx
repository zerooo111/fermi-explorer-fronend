import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to homepage after a short delay
    const redirectTimer = setTimeout(() => {
      navigate({ to: '/' })
    }, 2000)

    return () => clearTimeout(redirectTimer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#282c34] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#61dafb] mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-lg mb-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-sm text-gray-400">
          Redirecting to homepage in 2 seconds...
        </p>
      </div>
    </div>
  )
}