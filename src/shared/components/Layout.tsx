/**
 * Main application layout wrapper
 * Routes use this component in the root route
 */

import { Outlet } from '@tanstack/react-router'
import AppLayout from './v2/layout/AppLayout'

export default function Layout() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 sm:p-6 bg-background overflow-y-auto">
        <Outlet />
      </main>
    </AppLayout>
  )
}
