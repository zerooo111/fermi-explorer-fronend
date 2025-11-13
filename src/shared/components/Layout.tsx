import { Outlet } from '@tanstack/react-router'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-6 bg-zinc-950 overflow-y-auto">
        <Outlet />
      </main>
      <footer className="sticky bottom-0 bg-zinc-950 border-t border-zinc-800 p-4 sm:p-6 z-10">
        <div className="flex items-center justify-between container mx-auto max-w-screen-xl">
          <div className="text-xs sm:text-sm text-zinc-400">
            © {new Date().getFullYear()} Continuum Explorer. All rights reserved.
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-xs sm:text-sm"
            >
              Twitter
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-xs sm:text-sm"
            >
              GitHub
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-xs sm:text-sm"
            >
              Discord
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
