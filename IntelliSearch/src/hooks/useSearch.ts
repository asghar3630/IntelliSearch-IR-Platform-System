import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchDocuments } from '../api/searchApi'
import { PAGE_SIZE } from '../config/constants'
import type { SearchResponse } from '../types'

interface UseSearchParams {
  query: string
  page: number
  size?: number
}

export function searchQueryKey({ query, page, size = PAGE_SIZE }: UseSearchParams) {
  return ['search', query.trim().toLowerCase(), page, size] as const
}

/**
 * Drives the results page. Disabled until there is a non-empty query so the
 * home page doesn't fire requests. Keeps previous data during pagination so the
 * UI doesn't flash empty between pages.
 */
export function useSearch({ query, page, size = PAGE_SIZE }: UseSearchParams) {
  const trimmed = query.trim()

  return useQuery<SearchResponse>({
    queryKey: searchQueryKey({ query, page, size }),
    queryFn: ({ signal }) => searchDocuments({ query: trimmed, page, size }, signal),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: 1,
  })
}
