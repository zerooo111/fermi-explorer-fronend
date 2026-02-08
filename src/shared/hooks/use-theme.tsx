import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export const THEMES = [
  { id: "forest", label: "Forest", accent: "45 55% 68%" },
  { id: "midnight", label: "Midnight", accent: "217 70% 60%" },
  { id: "obsidian", label: "Obsidian", accent: "35 85% 55%" },
  { id: "vaporwave", label: "Vaporwave", accent: "320 80% 60%" },
  { id: "arctic", label: "Arctic", accent: "185 65% 50%" },
] as const

export type ThemeId = (typeof THEMES)[number]["id"]

const STORAGE_KEY = "fermi-theme"

type ThemeContextValue = {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "forest"
    return (localStorage.getItem(STORAGE_KEY) as ThemeId) || "forest"
  })

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    if (newTheme === "forest") {
      document.documentElement.removeAttribute("data-theme")
    } else {
      document.documentElement.setAttribute("data-theme", newTheme)
    }
  }

  useEffect(() => {
    if (theme !== "forest") {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
