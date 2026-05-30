import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './themeContext'

const THEME_COLORS: Record<Theme, string> = {
  light: '#f7f8fa',
  dark: '#0b1018',
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[theme])
  try {
    localStorage.setItem('theme', theme)
  } catch {
    /* storage unavailable — fall back to in-memory only */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The no-flash script in index.html already set the class; mirror it here.
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  )

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
