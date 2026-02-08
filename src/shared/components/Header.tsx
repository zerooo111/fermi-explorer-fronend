import { Link, useLocation } from "@tanstack/react-router";
import { useHealth } from "@/shared/hooks/useHealth";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
// import { ThemeSwitcher } from "@/shared/components/design-system/theme-switcher";
import { Logo } from "./Logo";

const StatusIndicator = ({
  isHealthy,
  isConnecting,
  isError,
}: {
  isHealthy: boolean;
  isConnecting: boolean;
  isError: boolean;
}) => {
  const getStatus = () => {
    if (isError) return "DISCONNECTED";
    if (isConnecting) return "CONNECTING...";
    if (isHealthy) return "CONNECTED";
    return "UNKNOWN";
  };

  return (
    <Badge
      variant={isError ? "destructive" : isConnecting ? "warning" : isHealthy ? "success" : "muted"}
    >
      <span className="size-2 rounded-full" />
      {getStatus()}
    </Badge>
  );
};

export default function Header() {
  const { data, isLoading: isConnecting, isError } = useHealth();
  const location = useLocation();
  const isHealthy = data?.status === "healthy";

  const isSequencingActive = location.pathname.startsWith("/sequencing");
  const isExecutionActive = location.pathname.startsWith("/execution");

  const explorerColor = isExecutionActive
    ? "text-blue-500"
    : "text-emerald-500";

  return (
    <header className="border-b border-border bg-background py-2">
      <nav className="px-4 sm:px-6 container flex items-center justify-between mx-auto max-w-screen-xl">
        <Link
          to="/sequencing"
          className="text-lg sm:text-xl flex items-center font-medium tracking-tight text-foreground"
        >
          <Logo className="h-6 pr-1 text-foreground" />
          Continuum
          <span className={cn("font-light ml-1", explorerColor)}>Explorer</span>
          <span className="bg-teal-400 ml-2 font-bold text-zinc-950 text-sm tracking-wide px-1.5 py-0.5">
            STAGING
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Explorer Tabs */}
          <div className="h-8 flex items-center border border-border rounded-md bg-card">
            <Link
              to="/sequencing"
              className={cn(
                "px-3 h-[30px] flex items-center text-xs sm:text-sm font-mono transition-colors rounded",
                isSequencingActive
                  ? "bg-secondary text-emerald-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sequencing
            </Link>
            <Link
              to="/execution"
              className={cn(
                "px-3 h-[30px] flex items-center text-xs sm:text-sm font-mono transition-colors rounded",
                isExecutionActive
                  ? "bg-secondary text-blue-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Execution
            </Link>
          </div>
          <StatusIndicator
            isHealthy={isHealthy}
            isConnecting={isConnecting}
            isError={isError}
          />
          {/* <ThemeSwitcher /> */}
        </div>
      </nav>
    </header>
  );
}
