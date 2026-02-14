import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/components/Logo";

function NavTab({
  to,
  label,
  active,
}: {
  to: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {active && (
        <span className="absolute inset-x-0 -bottom-[8px] h-px bg-accent" />
      )}
    </Link>
  );
}

export default function AppHeader() {
  const location = useLocation();

  const isSequencingActive = location.pathname.startsWith("/sequencing");
  const isExecutionActive = location.pathname.startsWith("/execution");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-12 items-center justify-between gap-4">
          {/* Left: Logo */}
          <Link
            to="/sequencing"
            className="flex font-pixel text-2xl items-center gap-2 text-foreground shrink-0"
          >
            <Logo className="h-6 text-foreground" />
            <span className="hidden sm:inline">Continuum</span>
            <span className="text-accent">Explorer</span>
          </Link>

          {/* Right: Navigation tabs */}
          <div className="flex items-center gap-1">
            <NavTab
              to="/sequencing"
              label="Sequencing"
              active={isSequencingActive}
            />
            <NavTab
              to="/execution"
              label="Execution"
              active={isExecutionActive}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
