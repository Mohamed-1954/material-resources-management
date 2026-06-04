/**
 * Inline placeholder rendered while a role-dashboard chunk is loading. Kept
 * intentionally small so the suspense boundary doesn't ship recharts.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[108px] animate-pulse rounded-xl bg-muted/40 ring-1 ring-border/60"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl bg-muted/40 ring-1 ring-border/60 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-xl bg-muted/40 ring-1 ring-border/60" />
      </div>
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
