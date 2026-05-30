import { lazy, Suspense, useState } from 'react'
import type { SearchDocument } from '../types'
import { SummaryText } from './SummaryText'

// Lazy-loaded so the heavy react-pdf / pdf.js worker stays out of the main bundle
// and only loads when a user actually opens a document.
const PdfViewerModal = lazy(() =>
  import('./PdfViewerModal').then((m) => ({ default: m.PdfViewerModal })),
)

interface ResultCardProps {
  doc: SearchDocument
}

export function ResultCard({ doc }: ResultCardProps) {
  const hasPdf = Boolean(doc.documentId && doc.documentId.trim())
  const hasLink = Boolean(doc.documentLink && doc.documentLink.trim())
  const sourceType = doc.sourceType?.trim() || 'General'
  const score = Number.isFinite(doc.score) ? doc.score.toFixed(2) : '—'

  const [viewerOpen, setViewerOpen] = useState(false)

  const openPdf = () => {
    if (hasPdf) setViewerOpen(true)
  }

  return (
    <article className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-subtle">
      {/* Title */}
      <button
        onClick={openPdf}
        disabled={!hasPdf}
        className="block text-left text-lg font-semibold leading-snug text-accent-700 transition-colors enabled:hover:underline disabled:cursor-default disabled:text-fg dark:text-accent-400"
      >
        {doc.title || 'Untitled document'}
      </button>

      {/* Metadata row */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {doc.publishedYear ? <span>{doc.publishedYear}</span> : null}
        {doc.publishedYear ? <span className="text-border">·</span> : null}
        <span className="rounded bg-surface-2 px-1.5 py-0.5 font-medium text-muted">
          {sourceType}
        </span>
        <span className="text-border">·</span>
        <span className="font-medium text-emerald-700 dark:text-emerald-400">
          Relevance {score}
        </span>
        {doc.authors?.trim() && (
          <>
            <span className="text-border">·</span>
            <span className="truncate">{doc.authors}</span>
          </>
        )}
      </div>

      {/* Summary */}
      <div className="mt-3">
        <SummaryText text={doc.summary ?? ''} />
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          onClick={openPdf}
          disabled={!hasPdf}
          title={hasPdf ? 'View the PDF in the viewer' : 'No document file available'}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M4 5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M13 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          View Document
        </button>

        <a
          href={hasLink ? doc.documentLink : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!hasLink}
          onClick={(e) => {
            if (!hasLink) e.preventDefault()
          }}
          title={hasLink ? 'Open the source link in a new tab' : 'No external link available'}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
            hasLink
              ? 'border-border bg-surface text-fg hover:bg-surface-2'
              : 'pointer-events-none border-border text-subtle opacity-50'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M14 4h6v6M20 4l-9 9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          External Link
        </a>

        <span className="ml-auto font-mono text-xs text-subtle">{doc.documentId}</span>
      </div>

      {viewerOpen && hasPdf && (
        <Suspense fallback={null}>
          <PdfViewerModal
            documentId={doc.documentId}
            title={doc.title || doc.filePath || 'Document'}
            onClose={() => setViewerOpen(false)}
          />
        </Suspense>
      )}
    </article>
  )
}
