import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  /** Optional content rendered between the logo and the theme toggle (e.g. search). */
  children?: ReactNode
  /** Compact, sticky variant used on the results page. */
  compact?: boolean
}

export function Header({ children, compact = false }: HeaderProps) {
  return (
    <header
      className={
        compact
          ? 'sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur transition-colors'
          : 'relative z-30'
      }
    >
      <div
        className={`mx-auto flex w-full max-w-5xl items-center gap-4 px-4 sm:px-6 ${
          compact ? 'h-16' : 'h-16'
        }`}
      >
        <Link
          to="/"
          aria-label="IntelliSearch home"
          className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50"
        >
          <Logo size={32} wordmarkClass="text-lg sm:text-xl" />
        </Link>

        {children && <div className="min-w-0 flex-1">{children}</div>}

        <div className="ml-auto shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
