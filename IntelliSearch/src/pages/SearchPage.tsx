import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { SearchBar } from '../components/SearchBar'
import { ResultCard } from '../components/ResultCard'
import { Pagination } from '../components/Pagination'
import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { ResultsSkeleton } from '../components/states/ResultsSkeleton'
import { useDebounce } from '../hooks/useDebounce'
import { useSearch } from '../hooks/useSearch'
import { SearchError } from '../api/searchApi'
import { SEARCH_DEBOUNCE_MS } from '../config/constants'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const query = searchParams.get('q') ?? ''
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0)

  const [input, setInput] = useState(query)
  const debouncedInput = useDebounce(input, SEARCH_DEBOUNCE_MS)
  const resultsTopRef = useRef<HTMLDivElement>(null)

  // Keep the input in sync when the URL query changes externally (back/forward,
  // topic clicks). Adjusting state during render is React's recommended pattern
  // here — cheaper than an effect and avoids a cascading re-render.
  const [prevQuery, setPrevQuery] = useState(query)
  if (query !== prevQuery) {
    setPrevQuery(query)
    setInput(query)
  }

  // Live search: commit debounced input to the URL (replace, reset to page 0).
  useEffect(() => {
    const trimmed = debouncedInput.trim()
    if (trimmed && trimmed !== query) {
      setSearchParams({ q: trimmed, page: '0' }, { replace: true })
    }
  }, [debouncedInput, query, setSearchParams])

  const { data, isLoading, isFetching, isError, error, refetch } = useSearch({
    query,
    page,
  })

  const goToPage = (next: number) => {
    setSearchParams({ q: query, page: String(next) })
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const submitSearch = (q: string) => {
    const trimmed = q.trim()
    if (trimmed) setSearchParams({ q: trimmed, page: '0' })
  }

  const runTopic = (topic: string) => {
    setInput(topic)
    setSearchParams({ q: topic, page: '0' })
  }

  // No query at all — send the user home.
  useEffect(() => {
    if (!query) navigate('/', { replace: true })
  }, [query, navigate])

  const errorMessage =
    error instanceof SearchError
      ? error.message
      : 'An unexpected error occurred while searching. Please try again.'

  const hasResults = (data?.documents?.length ?? 0) > 0

  return (
    <div className="min-h-screen">
      <Header compact>
        <div className="mx-auto max-w-xl">
          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={submitSearch}
            size="compact"
            loading={isFetching && !isLoading}
          />
        </div>
      </Header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <div ref={resultsTopRef} className="scroll-mt-20" />

        {/* Results summary */}
        {query && !isLoading && !isError && data && (
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-muted">
              {data.totalCount > 0 ? (
                <>
                  About{' '}
                  <span className="font-semibold text-fg">
                    {data.totalCount.toLocaleString()}
                  </span>{' '}
                  results for{' '}
                  <span className="font-medium text-fg">“{query}”</span>
                </>
              ) : (
                <>
                  No results for <span className="font-medium text-fg">“{query}”</span>
                </>
              )}
            </p>
            {data.totalPages > 1 && (
              <p className="text-sm text-subtle">
                Page {page + 1} of {data.totalPages}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        {isLoading ? (
          <ResultsSkeleton />
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={() => refetch()} />
        ) : hasResults ? (
          <>
            <div className="space-y-3">
              {data!.documents.map((doc, i) => (
                <ResultCard
                  key={doc.documentId || `${doc.title}-${i}`}
                  doc={doc}
                />
              ))}
            </div>
            <Pagination page={page} totalPages={data!.totalPages} onPageChange={goToPage} />
          </>
        ) : (
          <EmptyState query={query} onTopic={runTopic} />
        )}
      </main>
    </div>
  )
}
