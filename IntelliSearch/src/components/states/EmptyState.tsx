import { POPULAR_TOPICS } from '../../config/constants'

interface EmptyStateProps {
  query: string
  onTopic: (topic: string) => void
}

export function EmptyState({ query, onTopic }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-subtle">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <line
            x1="16.5"
            y1="16.5"
            x2="21"
            y2="21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h2 className="mt-5 text-xl font-semibold text-fg">No results found</h2>
      <p className="mt-2 text-sm text-muted">
        We couldn't find any documents matching{' '}
        <span className="font-medium text-fg">“{query}”</span>. Try different
        keywords, check your spelling, or explore a popular topic.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {POPULAR_TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => onTopic(topic)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent-300 hover:text-accent-700 dark:hover:border-accent-500/50 dark:hover:text-accent-300"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}
