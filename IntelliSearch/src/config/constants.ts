/**
 * Central configuration. Swap the backend by editing VITE_API_BASE_URL in .env
 * (falls back to localhost:8080 when the env var is absent).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const SEARCH_ENDPOINT = `${API_BASE_URL}/api/search`

/** Endpoint for lazily fetching a single document's base64 PDF content. */
export const documentContentEndpoint = (documentId: string) =>
  `${API_BASE_URL}/api/documents/${encodeURIComponent(documentId)}/content`

/** Results requested per page. */
export const PAGE_SIZE = 10

/** Characters shown before a summary is truncated with a "Read more" affordance. */
export const SUMMARY_TRUNCATE_LENGTH = 512

/** Debounce delay (ms) applied to live-search input on the home page. */
export const SEARCH_DEBOUNCE_MS = 400

/** Suggested topics surfaced on the home page and empty state. */
export const POPULAR_TOPICS = [
  'deep learning',
  'information retrieval',
  'natural language processing',
  'computer vision',
  'reinforcement learning',
  'knowledge graphs',
] as const
