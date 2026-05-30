function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-2/3 rounded bg-surface-2" />
        <div className="flex gap-2">
          <div className="h-3 w-12 rounded bg-surface-2" />
          <div className="h-3 w-16 rounded bg-surface-2" />
          <div className="h-3 w-20 rounded bg-surface-2" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-3 w-full rounded bg-surface-2" />
          <div className="h-3 w-full rounded bg-surface-2" />
          <div className="h-3 w-4/5 rounded bg-surface-2" />
        </div>
        <div className="flex gap-2.5 pt-2">
          <div className="h-9 w-36 rounded-lg bg-surface-2" />
          <div className="h-9 w-32 rounded-lg bg-surface-2" />
        </div>
      </div>
    </div>
  )
}

export function ResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading results">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
