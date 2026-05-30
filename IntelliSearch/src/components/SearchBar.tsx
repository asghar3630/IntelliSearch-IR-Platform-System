import { useEffect, useRef, useState, type FormEvent } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  size?: 'hero' | 'compact'
  autoFocus?: boolean
  loading?: boolean
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line
        x1="16.5"
        y1="16.5"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  size = 'hero',
  autoFocus = false,
  loading = false,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSubmit(value.trim())
  }

  const isHero = size === 'hero'

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search documents"
      className="w-full"
    >
      <div
        className={`flex items-center gap-2 rounded-full border bg-surface transition-[border-color,box-shadow] duration-150 ${
          focused
            ? 'border-accent-500 shadow-md shadow-accent-500/10'
            : 'border-border hover:border-subtle'
        } ${isHero ? 'h-14 pl-5 pr-2' : 'h-11 pl-4 pr-1.5'}`}
      >
        <SearchIcon
          className={`shrink-0 ${focused ? 'text-accent-600 dark:text-accent-400' : 'text-subtle'} ${
            isHero ? 'h-5 w-5' : 'h-[18px] w-[18px]'
          }`}
        />

        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isHero ? 'Search papers, topics, or authors' : 'Search'}
          aria-label="Search query"
          autoComplete="off"
          spellCheck={false}
          className={`min-w-0 flex-1 bg-transparent text-fg placeholder:text-subtle outline-none ${
            isHero ? 'text-base' : 'text-sm'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        <button
          type="submit"
          disabled={!value.trim() || loading}
          aria-label="Run search"
          className={`grid shrink-0 place-items-center rounded-full bg-accent-600 font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-45 ${
            isHero ? 'h-11 w-11 sm:w-auto sm:px-5' : 'h-8 w-8'
          }`}
        >
          {loading ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
          ) : isHero ? (
            <>
              <span className="hidden sm:inline">Search</span>
              <SearchIcon className="h-5 w-5 sm:hidden" />
            </>
          ) : (
            <SearchIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  )
}
