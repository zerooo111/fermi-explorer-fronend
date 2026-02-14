/**
 * Application Footer V2
 *
 * Minimal footer with copyright and social links.
 */

export default function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background p-4 sm:p-6">
      <div className="flex items-center justify-between container mx-auto max-w-screen-xl">
        <div className="text-xs sm:text-sm text-muted-foreground">
          © {currentYear} Continuum Explorer. All rights reserved.
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
          >
            Twitter
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
          >
            GitHub
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  )
}
