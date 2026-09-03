export default function Loading({ ready }) {
  if (ready) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-onyx-bg text-onyx-muted text-[13px] tracking-wide z-[30]">
      Loading model…
    </div>
  )
}
