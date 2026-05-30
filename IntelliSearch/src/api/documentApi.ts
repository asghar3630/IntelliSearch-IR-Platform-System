import { documentContentEndpoint } from '../config/constants'

export type DocumentErrorKind = 'network' | 'timeout' | 'http' | 'parse'

export class DocumentError extends Error {
  kind: DocumentErrorKind
  status?: number

  constructor(message: string, kind: DocumentErrorKind, status?: number) {
    super(message)
    this.name = 'DocumentError'
    this.kind = kind
    this.status = status
  }
}

const REQUEST_TIMEOUT_MS = 30_000

function isContentResponse(data: unknown): data is { documentBase64: string } {
  if (typeof data !== 'object' || data === null) return false
  return typeof (data as Record<string, unknown>).documentBase64 === 'string'
}

/** Fetch a document's base64 PDF payload by id. */
export async function fetchDocumentContent(
  documentId: string,
  signal?: AbortSignal,
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  // Abort if either the caller's signal or our timeout fires.
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  let response: Response
  try {
    response = await fetch(documentContentEndpoint(documentId), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
  } catch {
    clearTimeout(timeout)
    if (controller.signal.aborted && !signal?.aborted) {
      throw new DocumentError('Loading the document timed out. Please try again.', 'timeout')
    }
    throw new DocumentError(
      'Unable to reach the document service. Check your connection and that the backend is running.',
      'network',
    )
  }
  clearTimeout(timeout)

  if (!response.ok) {
    throw new DocumentError(
      `The document service responded with an error (${response.status}).`,
      'http',
      response.status,
    )
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new DocumentError('Received a malformed response from the document service.', 'parse')
  }

  if (!isContentResponse(data)) {
    throw new DocumentError('The document response was not in the expected format.', 'parse')
  }

  return data.documentBase64
}
