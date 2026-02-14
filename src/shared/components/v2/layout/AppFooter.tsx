import {
  Plugs,
  PlugsConnected,
  CircleNotch,
  Broadcast,
  XLogo,
  GithubLogo,
  DiscordLogo,
} from "@phosphor-icons/react";
import { useHealth } from "@/shared/hooks/useHealth";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui";

function StatusIndicator({
  isHealthy,
  isConnecting,
  isError,
}: {
  isHealthy: boolean;
  isConnecting: boolean;
  isError: boolean;
}) {
  if (isConnecting) {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] text-warning">
        <CircleNotch weight="bold" className="w-3 h-3 animate-spin" />
        Connecting
      </span>
    );
  }

  if (isError) {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] text-destructive">
        <Plugs weight="bold" className="w-3 h-3" />
        Disconnected
      </span>
    );
  }

  if (isHealthy) {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] text-success">
        <PlugsConnected weight="bold" className="w-3 h-3" />
        Connected
      </span>
    );
  }

  return null;
}

export default function AppFooter() {
  const { data, isLoading: isConnecting, isError } = useHealth();
  const isHealthy = data?.status === "healthy";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-8 items-center justify-between">
          {/* Left: Status + environment */}
          <div className="flex items-center gap-4">
            <StatusIndicator
              isHealthy={isHealthy}
              isConnecting={isConnecting}
              isError={isError}
            />
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium text-accent">
              <Broadcast weight="fill" className="w-3 h-3" />
              STAGING
            </span>
          </div>

          {/* Center: Copyright */}
          <span className="hidden sm:block font-mono text-[10px] text-muted-foreground">
            &copy; {currentYear} Continuum
          </span>

          {/* Right: Social links */}
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  />
                }
              >
                <XLogo weight="bold" className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent>Twitter</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  />
                }
              >
                <GithubLogo weight="bold" className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent>GitHub</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  />
                }
              >
                <DiscordLogo weight="bold" className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent>Discord</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </footer>
  );
}
