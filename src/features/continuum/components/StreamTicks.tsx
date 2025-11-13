import { useEffect, useMemo, useRef, useState } from "react";
import type { Tick } from "@/shared/types/shared/api";
import { continuumRoutes } from "@/shared/lib/routes";
import { cn } from "@/shared/lib/utils";

interface StreamTicksProps {
  startTick?: number;
  limit?: number;
  className?: string;
  onTick?: (tick: Tick) => void;
}

export function StreamTicks({ startTick, limit = 50, className, onTick }: StreamTicksProps) {
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const streamUrl = useMemo(() => continuumRoutes.STREAM_TICKS(
    startTick !== undefined ? { start_tick: startTick } : undefined
  ), [startTick]);

  useEffect(() => {
    function connect() {
      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;
      setError(null);

      es.onopen = () => {
        setConnected(true);
      };

      es.onmessage = (event: MessageEvent) => {
        try {
          const tick: Tick = JSON.parse(event.data);
          setTicks(prev => {
            const next = [tick, ...prev].slice(0, limit);
            return next;
          });
          onTick?.(tick);
        } catch (e) {
          // Ignore malformed lines
        }
      };

      es.onerror = () => {
        setConnected(false);
        setError("Stream error. Reconnecting...");
        es.close();
        if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
        // Simple backoff retry
        reconnectTimerRef.current = window.setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [streamUrl, limit, onTick]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase">Stream Ticks</h3>
        <span className={cn("text-xs sm:text-sm font-mono", connected ? "text-emerald-400" : "text-zinc-400")}>{connected ? "connected" : "disconnected"}</span>
      </div>

      {error && (
        <div className="text-xs sm:text-sm text-amber-400 font-mono">{error}</div>
      )}

      <div className="border border-zinc-700 divide-y divide-zinc-700 rounded overflow-hidden">
        {ticks.length === 0 ? (
          <div className="p-3 text-sm text-zinc-400">Waiting for ticks...</div>
        ) : (
          ticks.map((t) => (
            <div key={t.tick_number} className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm text-zinc-200 font-mono">
              <div>Tick #{t.tick_number}</div>
              <div>Txns: {t.transactions?.length ?? 0}</div>
              <div className="hidden sm:block truncate">Batch: {t.transaction_batch_hash}</div>
              <div className="hidden sm:block truncate">VDF: {t.vdf_proof?.output}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StreamTicks;


