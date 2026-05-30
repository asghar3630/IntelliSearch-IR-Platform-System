interface PaginationProps {
  /** Zero-based current page. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/** Builds a compact page list with ellipses, e.g. [0, 'gap', 3, 4, 5, 'gap', 9]. */
function buildPages(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const pages: (number | 'gap')[] = [0]
  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  if (start > 1) pages.push('gap')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 2) pages.push('gap')

  pages.push(total - 1)
  return pages
}

function StepButton({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg transition-colors enabled:hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  )
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPages(page, totalPages)

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1.5"
      aria-label="Search results pages"
    >
      <StepButton label="Prev" disabled={page <= 0} onClick={() => onPageChange(page - 1)} />

      <ul className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className="px-1.5 text-subtle" aria-hidden>
              …
            </li>
          ) : (
            <li key={p}>
              <button
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p + 1}`}
                aria-current={p === page ? 'page' : undefined}
                className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-accent-600 text-white'
                    : 'border border-border bg-surface text-fg hover:bg-surface-2'
                }`}
              >
                {p + 1}
              </button>
            </li>
          ),
        )}
      </ul>

      <StepButton
        label="Next"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  )
}
