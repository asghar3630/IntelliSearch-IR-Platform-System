import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { SearchBar } from '../components/SearchBar'
import { ThemeToggle } from '../components/ThemeToggle'
import { POPULAR_TOPICS } from '../config/constants'

export function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const runSearch = (q: string) => {
    const trimmed = q.trim()
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}&page=0`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar — theme toggle lives at the top of the app */}
      <div className="flex items-center justify-end px-4 py-4 sm:px-6">
        <ThemeToggle />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-28 sm:px-6">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <Logo size={56} showWordmark={false} />

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            Intelli<span className="text-accent-600 dark:text-accent-400">Search</span>
          </h1>

          <p className="mt-3 max-w-md text-base text-muted">
            Search  research papers and technical documents and find
            the most relevant results, fast.
          </p>

          <div className="mt-8 w-full">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={runSearch}
              size="hero"
              autoFocus
            />
          </div>

          {/* Suggested topics */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-subtle">Popular:</span>
            {POPULAR_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setQuery(topic)
                  runSearch(topic)
                }}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent-300 hover:text-accent-700 dark:hover:border-accent-500/50 dark:hover:text-accent-300"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="px-4 pb-6 text-center text-xs text-subtle">
        Powered by Apache Lucene · BM25 ranking
      </footer>
    </div>
  )
}
