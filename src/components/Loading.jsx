export default function Loading({ ready, progress = null, failed = false, onRetry }) {
  if (ready) return null

  // fraction is null while the server hasn't reported a total length yet
  const pct = progress?.fraction != null ? Math.round(progress.fraction * 100) : null
  const mb = progress?.bytes != null ? (progress.bytes / (1024 * 1024)).toFixed(1) : null

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-onyx-bg text-onyx-muted text-[13px] tracking-wide z-[30]">
      {failed ? (
        <>
          <span>Couldn't load the 3D model. Check your connection.</span>
          <button
            className="mt-1 px-5 py-2.5 rounded-full border border-onyx-accent text-onyx-accent text-[12px] tracking-wider uppercase cursor-pointer bg-transparent active:bg-[rgba(201,162,74,0.12)]"
            onClick={onRetry}
          >
            Retry
          </button>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
