import { useMemo } from 'react'

export default function Outro({ progress, t2 }) {
  // Show after the lifestyle phase fades out (progress > 0.92), but not during sunglasses chapter
  const opacity = useMemo(() => {
    if (t2 > 0) return 0
    if (progress < 0.92) return 0
    return Math.min(1, (progress - 0.92) / 0.06)
  }, [progress, t2])

  if (opacity <= 0.01) return null

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-[12] pointer-events-none flex flex-col items-center pb-28"
      style={{ opacity }}
    >
      {/* Outro line */}
      <p className="text-center text-[19px] font-medium text-onyx-text tracking-tight mb-10">
        Every frame tells a story.
      </p>

      {/* Shop info block */}
      <div className="text-center pointer-events-auto">
        <p className="text-[11px] tracking-[0.18em] uppercase text-onyx-accent mb-3">
          Visit Us
        </p>
        <p className="text-[13px] text-onyx-text mb-1">Kariakoo</p>
        <p className="text-[12px] text-onyx-muted mb-4">08:00 – 18:00</p>

        <div className="flex flex-col items-center gap-2">
          <a
            href="https://wa.me/255753474748?text=Hi%2C%20I%27m%20interested%20in%20your%20glasses"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-onyx-text no-underline hover:text-onyx-accent transition-colors"
          >
            +255 753 474 748
          </a>
          <a
            href="https://wa.me/255695525257?text=Hello%2C%20I%27d%20like%20to%20know%20more"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-onyx-text no-underline hover:text-onyx-accent transition-colors"
          >
            +255 695 525 257
          </a>
        </div>
      </div>
    </div>
  )
}
