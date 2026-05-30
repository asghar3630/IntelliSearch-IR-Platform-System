export interface SearchDocument {
  documentId: string
  title: string
  authors: string
  publishedYear: number
  summary: string
  documentLink: string
  score: number
  filePath: string
  /** Optional source classification surfaced by some backends. */
  sourceType?: string
}

export interface SearchResponse {
  query: string
  page: number
  size: number
  totalCount: number
  totalPages: number
  documents: SearchDocument[]
}

export interface SearchRequest {
  query: string
  page: number
  size: number
}
