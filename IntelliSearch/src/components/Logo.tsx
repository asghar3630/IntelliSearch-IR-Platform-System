interface LogoProps {
  /** Pixel size of the icon mark. */
  size?: number
  /** Whether to render the "IntelliSearch" wordmark next to the mark. */
  showWordmark?: boolean
  /** Tailwind font-size class for the wordmark. */
  wordmarkClass?: string
}

/**
 * Clean brand mark: a solid-accent magnifying glass. Static — no looping
 * animation — so it reads as an intentional product logo.
 */
export function Logo({
  size = 36,
  showWordmark = true,
  wordmarkClass = 'text-xl',
}: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        fill="none"
        role="img"
        aria-label="IntelliSearch logo"
        className="shrink-0"
      >
        <rect width="40" height="40" rx="9" className="fill-accent-600" />
        <circle cx="18" cy="18" r="7.5" fill="none" stroke="#fff" strokeWidth="2.6" />
        <line
          x1="23.4"
          y1="23.4"
          x2="29"
          y2="29"
          stroke="#fff"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span className={`font-bold tracking-tight text-fg ${wordmarkClass}`}>
          Intelli<span className="text-accent-600 dark:text-accent-400">Search</span>
        </span>
      )}
    </span>
  )
}
