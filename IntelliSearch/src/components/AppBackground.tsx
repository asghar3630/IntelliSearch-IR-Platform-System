/**
 * Subtle, static page backdrop: the themed canvas plus a faint accent wash at
 * the top for depth. No animation — intentionally cheap to paint.
 */
export function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-canvas">
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-accent-500/[0.05] to-transparent dark:from-accent-500/[0.08]" />
    </div>
  )
}
