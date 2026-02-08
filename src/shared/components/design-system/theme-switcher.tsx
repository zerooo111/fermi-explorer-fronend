import { useTheme, THEMES } from "@/shared/hooks/use-theme"
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2 border border-border bg-card px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: `hsl(${current.accent})` }}
        />
        {current.label}
      </PopoverTrigger>

      <PopoverContent className="w-40 p-1">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex w-full items-center gap-2.5 px-2.5 py-2 font-mono text-[11px] tracking-wide transition-colors ${
              t.id === theme
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full ring-1 ring-white/10"
              style={{ backgroundColor: `hsl(${t.accent})` }}
            />
            {t.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
