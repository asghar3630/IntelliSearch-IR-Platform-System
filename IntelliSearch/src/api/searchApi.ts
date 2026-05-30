import { SEARCH_ENDPOINT } from '../config/constants'
import type { SearchRequest, SearchResponse } from '../types'

export type SearchErrorKind = 'network' | 'timeout' | 'http' | 'parse'

export class SearchError extends Error {
  kind: SearchErrorKind
  status?: number

  constructor(message: string, kind: SearchErrorKind, status?: number) {
    super(message)
    this.name = 'SearchError'
    this.kind = kind
    this.status = status
  }
}

const REQUEST_TIMEOUT_MS = 15_000

function isValidResponse(data: unknown): data is SearchResponse {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return Array.isArray(d.documents) && typeof d.totalCount === 'number'
}

export async function searchDocuments(
  request: SearchRequest,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  // Abort if either the caller's signal or our timeout fires.
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  let response: Response
  try {
    response = await fetch(SEARCH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
  } catch {
    clearTimeout(timeout)
    if (controller.signal.aborted && !signal?.aborted) {
      throw new SearchError('The search request timed out. Please try again.', 'timeout')
    }
    throw new SearchError(
      'Unable to reach the search service. Check your connection and that the backend is running.',
      'network',
    )
  }
  clearTimeout(timeout)

  if (!response.ok) {
    throw new SearchError(
      `The search service responded with an error (${response.status}).`,
      'http',
      response.status,
    )
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new SearchError('Received a malformed response from the search service.', 'parse')
  }

  if (!isValidResponse(data)) {
    throw new SearchError('The search response was not in the expected format.', 'parse')
  }

  return data
}
