import { Link, useLocation } from "@tanstack/react-router";
import { useHealth } from "@/shared/hooks/useHealth";
import { cn } from "@/shared/lib/utils";
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

  const getStatusColor = () => {
    if (isError) return "bg-red-500 border-red-400";
    if (isConnecting) return "bg-yellow-500 border-yellow-400";
    if (isHealthy) return "bg-green-500 border-green-400";
    return "bg-zinc-500 border-zinc-400";
  };

  const getTextColor = () => {
    if (isError) return "text-red-400";
    if (isConnecting) return "text-yellow-400";
    if (isHealthy) return "text-green-400";
    return "text-zinc-400";
  };

  return (
    <div
      className={cn(
        "font-mono font-medium flex items-center gap-2 sm:gap-3 border border-zinc-700  px-3 h-8 bg-zinc-950 hover:bg-zinc-900 transition-colors duration-200 cursor-pointer text-xs sm:text-sm"
      )}
    >
      <span className={cn("size-2 border", getStatusColor())} />
      <span className={cn("tracking-wider", getTextColor())}>
        {getStatus()}
      </span>
    </div>
  );
};

export default function Header() {
  const { data, isLoading: isConnecting, isError } = useHealth();
  const location = useLocation();
  const isHealthy = data?.status === "healthy";

  const isSequencingActive = location.pathname.startsWith("/sequencing");
  const isExecutionActive = location.pathname.startsWith("/execution");

  const explorerColor = isExecutionActive ? "text-blue-500" : "text-emerald-500";

  return (
    <header className="border-b border-zinc-700 bg-zinc-950 py-2">
      <nav className="px-4 sm:px-6 container flex items-center justify-between mx-auto max-w-screen-xl">
        <Link
          to="/sequencing"
          className="text-lg sm:text-xl flex items-center font-medium tracking-tight text-zinc-100"
        >
          <Logo className="h-6 pr-1" />
          Fermi
          <span className={cn("font-light ml-1", explorerColor)}>Explorer</span>
          <span className="bg-yellow-400 ml-2 font-bold text-zinc-950 text-sm tracking-wide px-1.5 py-0.5">
            TESTNET
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Explorer Tabs */}
          <div className="h-8 flex items-center  border border-zinc-700 rounded-md bg-zinc-900">
            <Link
              to="/sequencing"
              className={cn(
                "px-3 h-[30px] flex items-center text-xs sm:text-sm font-mono transition-colors rounded",
                isSequencingActive
                  ? "bg-zinc-800 text-emerald-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Sequencing
            </Link>
            <Link
              to="/execution"
              className={cn(
                "px-3 h-[30px] flex items-center text-xs sm:text-sm font-mono transition-colors rounded",
                isExecutionActive
                  ? "bg-zinc-800 text-blue-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
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
        </div>
      </nav>
    </header>
  );
}
