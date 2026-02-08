import { useState, useCallback } from "react"

export type TerminalPreset = "trading" | "wide-chart" | "compact"

const STORAGE_KEY = "fermi-terminal-preset"

function getInitialPreset(): TerminalPreset {
  if (typeof window === "undefined") return "trading"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "trading" || stored === "wide-chart" || stored === "compact") {
    return stored
  }
  return "trading"
}

export function useTerminalLayout() {
  const [preset, setPresetState] = useState<TerminalPreset>(getInitialPreset)

  const setPreset = useCallback((next: TerminalPreset) => {
    setPresetState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPresetState("trading")
  }, [])

  return { preset, setPreset, reset }
}
