import { Outlet } from '@tanstack/react-router'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <main className="p-6 bg-zinc-950">
        <Outlet />
      </main>
    </div>
  )
}
