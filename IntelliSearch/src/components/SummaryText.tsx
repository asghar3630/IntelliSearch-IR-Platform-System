import { useState } from 'react'
import { SUMMARY_TRUNCATE_LENGTH } from '../config/constants'

interface SummaryTextProps {
  text: string
}

/**
 * Renders a document summary, truncating at SUMMARY_TRUNCATE_LENGTH characters
 * with an inline "Read more" toggle.
 */
export function SummaryText({ text }: SummaryTextProps) {
  const [expanded, setExpanded] = useState(false)

  if (!text) {
    return <p className="text-sm italic text-subtle">No summary available.</p>
  }

  const isLong = text.length > SUMMARY_TRUNCATE_LENGTH

  if (!isLong) {
    return <p className="text-sm leading-relaxed text-muted">{text}</p>
  }

  const cut = text.slice(0, SUMMARY_TRUNCATE_LENGTH)
  const preview = cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)

  return (
    <p className="text-sm leading-relaxed text-muted">
      {expanded ? text : `${preview}… `}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="font-medium text-accent-700 transition-colors hover:underline dark:text-accent-400"
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </p>
  )
}
