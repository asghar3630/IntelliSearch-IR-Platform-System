import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { DocumentError, fetchDocumentContent } from '../api/documentApi'

// Bundle the pdf.js worker as a separate asset (Vite resolves the URL at build
// time). Lazy-loading this whole module keeps the heavy worker out of the main
// bundle until a PDF is actually opened.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface PdfViewerModalProps {
  /** Document id; its base64 PDF content is fetched lazily when the modal opens. */
  documentId: string
  /** Document title shown in the modal header. */
  title?: string
  onClose: () => void
}

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SCALE_STEP = 0.25

export function PdfViewerModal({ documentId, title, onClose }: PdfViewerModalProps) {
  const [base64, setBase64] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])

  // Fetch the document's base64 content on open (lazy load).
  useEffect(() => {
    const controller = new AbortController()
    setBase64(null)
    setFetchError(null)
    fetchDocumentContent(documentId, controller.signal)
      .then(setBase64)
      .catch((err) => {
        if (controller.signal.aborted) return
        setFetchError(
          err instanceof DocumentError
            ? err.message
            : 'Could not load this document. Please try again.',
        )
      })
    return () => controller.abort()
  }, [documentId])

  // Normalize into a data URI string. Memoized so react-pdf doesn't reload the
  // document on every render (a fresh object/string identity triggers a reload).
  const file = useMemo(() => {
    if (!base64) return null
    const trimmed = base64.trim()
    return trimmed.startsWith('data:')
      ? trimmed
      : `data:application/pdf;base64,${trimmed}`
  }, [base64])

  const options = useMemo(() => ({}), [])

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  // Track the scroll container width so the page scales responsively.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () => setContainerWidth(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    pageRefs.current = new Array(numPages).fill(null)
    setNumPages(numPages)
    setPageNumber(1)
    setError(null)
  }, [])

  const onLoadError = useCallback(() => {
    setError('This document could not be displayed. It may be corrupted or in an unexpected format.')
  }, [])

  // Track which page is currently in view so the "X / Y" counter stays accurate
  // as the user scrolls through the continuous page stack.
  useEffect(() => {
    const root = scrollRef.current
    if (!root || numPages === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const idx = pageRefs.current.indexOf(visible.target as HTMLDivElement)
          if (idx >= 0) setPageNumber(idx + 1)
        }
      },
      { root, threshold: [0.25, 0.5, 0.75] },
    )
    pageRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [numPages])

  const scrollToPage = (n: number) => {
    pageRefs.current[n - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const goPrev = () => scrollToPage(Math.max(1, pageNumber - 1))
  const goNext = () => scrollToPage(Math.min(numPages, pageNumber + 1))
  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))
  const resetZoom = () => setScale(1)

  // Page width: fit the container (minus padding) capped at a readable max, then
  // multiply by the zoom scale.
  const pageWidth = containerWidth
    ? Math.min(containerWidth - 32, 900) * scale
    : undefined

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `PDF viewer: ${title}` : 'PDF viewer'}
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2.5 sm:gap-3 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-fg sm:text-base">
          {title || 'Document'}
        </h2>

        {/* Page navigation */}
        {numPages > 0 && !error && (
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-1 py-0.5">
            <IconButton label="Previous page" onClick={goPrev} disabled={pageNumber <= 1}>
              <path d="M15 18l-6-6 6-6" />
            </IconButton>
            <span className="px-1 text-xs tabular-nums text-muted sm:text-sm">
              {pageNumber} / {numPages}
            </span>
            <IconButton label="Next page" onClick={goNext} disabled={pageNumber >= numPages}>
              <path d="M9 18l6-6-6-6" />
            </IconButton>
          </div>
        )}

        {/* Zoom */}
        {numPages > 0 && !error && (
          <div className="hidden items-center gap-1 rounded-lg border border-border bg-surface-2 px-1 py-0.5 sm:flex">
            <IconButton label="Zoom out" onClick={zoomOut} disabled={scale <= MIN_SCALE}>
              <path d="M5 12h14" />
            </IconButton>
            <button
              onClick={resetZoom}
              className="min-w-[3rem] px-1 text-xs tabular-nums text-muted transition-colors hover:text-fg sm:text-sm"
              title="Reset zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <IconButton label="Zoom in" onClick={zoomIn} disabled={scale >= MAX_SCALE}>
              <path d="M12 5v14M5 12h14" />
            </IconButton>
          </div>
        )}

        {/* Download */}
        {file && (
          <a
            href={file}
            download={(title || 'document').replace(/\.pdf$/i, '') + '.pdf'}
            title="Download PDF"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-muted transition-colors hover:text-fg"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </a>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close viewer"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {/* Page area */}
      <div
        ref={scrollRef}
        className="flex flex-1 justify-center overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {fetchError || error ? (
          <div className="m-auto max-w-sm text-center">
            <p className="text-sm text-red-300">{fetchError ?? error}</p>
          </div>
        ) : !file ? (
          <ViewerSpinner />
        ) : (
          <Document
            file={file}
            options={options}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={<ViewerSpinner />}
            error={<></>}
            className="flex flex-col items-center gap-4"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <div
                key={`page_${i + 1}`}
                ref={(el) => {
                  pageRefs.current[i] = el
                }}
              >
                <Page
                  pageNumber={i + 1}
                  width={pageWidth}
                  loading={<ViewerSpinner />}
                  className="overflow-hidden rounded-lg shadow-2xl shadow-black/40"
                  renderTextLayer
                  renderAnnotationLayer
                />
              </div>
            ))}
          </Document>
        )}
      </div>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md text-muted transition-colors enabled:hover:bg-surface enabled:hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </button>
  )
}

function ViewerSpinner() {
  return (
    <div className="m-auto flex flex-col items-center gap-3 py-20 text-white/80">
      <svg viewBox="0 0 24 24" className="h-8 w-8 animate-spin" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="opacity-25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-sm">Loading document…</span>
    </div>
  )
}
