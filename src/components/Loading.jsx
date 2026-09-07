export default function Loading({ ready, progress = null }) {
  if (ready) return null

  // fraction is null while the server hasn't reported a total length yet
  const pct = progress?.fraction != null ? Math.round(progress.fraction * 100) : null
  const mb = progress?.bytes != null ? (progress.bytes / (1024 * 1024)).toFixed(1) : null

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-onyx-bg text-onyx-muted text-[13px] tracking-wide z-[30]">
      <span>{pct != null ? `Loading model… ${pct}%` : 'Loading model…'}</span>
      {mb != null && pct == null && (
        <span className="text-[11px] text-onyx-muted/70">{mb} MB downloaded</span>
      )}
      {pct != null && (
        <div className="w-48 h-px bg-onyx-line overflow-hidden">
          <div
            className="h-full bg-onyx-accent transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
