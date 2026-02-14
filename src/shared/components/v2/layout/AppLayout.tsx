/**
 * Main Application Layout V2
 *
 * New layout using Base UI components with resizable panels and responsive design.
 * Features modular header, footer, and content area with optional side panels.
 */

import type { ReactNode } from 'react'
import { Outlet } from '@tanstack/react-router'
import AppHeader from './AppHeader'
import AppFooter from './AppFooter'

export interface AppLayoutProps {
  children?: ReactNode
}

/**
 * Main application layout component
 *
 * Structure:
 * ┌─────────────────────────────────┐
 * │          AppHeader              │
 * ├─────────────────────────────────┤
 * │                                 │
 * │      Main Content Area          │
 * │      (Outlet / children)        │
 * │                                 │
 * ├─────────────────────────────────┤
 * │          AppFooter              │
 * └─────────────────────────────────┘
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto">
        {children ?? <Outlet />}
      </main>
      <AppFooter />
    </div>
  )
}
