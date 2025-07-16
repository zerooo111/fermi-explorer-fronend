import { Outlet } from '@tanstack/react-router'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}
