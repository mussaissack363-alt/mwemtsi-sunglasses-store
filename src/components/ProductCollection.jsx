import { useMemo } from 'react'

const PART_LABELS = { frame: 'Frames', lenses: 'Lenses', sunglasses: 'Sunglasses' }
const CENTER_GROUPS = ['frame', 'lenses', 'sunglasses']

function bandOpacity(p, inStart, inEnd, outStart, outEnd) {
  if (p <= inStart) return 0
  if (p < inEnd) return (p - inStart) / (inEnd - inStart)
  if (p <= outStart) return 1
  if (p < outEnd) return 1 - (p - outStart) / (outEnd - outStart)
  return 0
}

export default function ProductCollection({ activePart, products, onProductClick, variant = 'bottom', t2 = 1 }) {
  const collectionPart = useMemo(() => {
    if (activePart && activePart !== 'sunglasses') return activePart
    if (activePart === 'sunglasses') return 'sunglasses'
    return null
  }, [activePart])

  const items = collectionPart ? (products[collectionPart] || []) : []

  /* ─── Center popup (end of scroll): frames, lenses, sunglasses ── */
  if (variant === 'center') {
    return (
      <div className="fixed left-0 right-0 top-1/2 -translate-y-1/2 z-[16] flex justify-center pointer-events-none px-4 max-sm:px-3">
        <div
          className="pointer-events-auto max-w-full"
          style={{
            background: 'rgba(10, 10, 11, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(35, 35, 38, 0.6)',
            borderRadius: '12px',
            padding: '16px 20px',
            maxHeight: 'min(72vh, 620px)',
            overflowY: 'auto',
          }}
        >
          <div className="flex flex-col gap-5">
            {CENTER_GROUPS.map((partId, gi) => {
              const groupItems = products[partId] || []
              if (groupItems.length === 0) return null

              // Stagger each group in, the same way the lifestyle photos pop in
              const inStart = 0.70 + gi * 0.07
              const inEnd = inStart + 0.09
              const opacity = bandOpacity(t2, inStart, inEnd, 2, 2)

              return (
                <div
                  key={partId}
                  className="text-center"
                  style={{
                    opacity,
                    transform: `translateY(${(1 - opacity) * 16}px)`,
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                  }}
                >
                  <span className="text-[10px] tracking-[0.18em] uppercase text-onyx-accent font-medium">
                    {PART_LABELS[partId] || partId}
                  </span>
                  <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth mt-2" style={{ scrollSnapType: 'x proximity' }}>
                    {groupItems.map((p) => (
                      <button
                        key={p.id}
                        className="flex-none w-[120px] rounded-lg overflow-hidden cursor-pointer border border-onyx-line/40 text-left"
                        style={{
                          background: 'rgba(19, 19, 21, 0.5)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          scrollSnapAlign: 'start',
                          transition: 'border-color 0.15s ease, transform 0.15s ease',
                        }}
                        onClick={() => onProductClick?.(partId)}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,162,74,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(35,35,38,0.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <div className="h-12 w-full" style={{ background: p.color, opacity: 0.7 }} />
                        <div className="px-2.5 py-2">
                          <p className="text-[10.5px] font-semibold m-0 text-onyx-text truncate">{p.name}</p>
                          <p className="text-[10px] text-onyx-accent mt-0.5 mb-0">{p.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ─── Bottom strip (glasses chapter) ── */
  const isVisible = items.length > 0

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-[16] flex justify-center pointer-events-none px-4 pb-6"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <div
        className="pointer-events-auto max-w-full overflow-x-auto"
        style={{
          background: 'rgba(10, 10, 11, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(35, 35, 38, 0.6)',
          borderRadius: '12px',
          padding: '12px 16px',
        }}
      >
        {/* Label */}
        <div className="text-center mb-2">
          <span className="text-[10px] tracking-[0.18em] uppercase text-onyx-accent font-medium">
            {PART_LABELS[collectionPart] || collectionPart}
          </span>
        </div>

        {/* Product row */}
        <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth" style={{ scrollSnapType: 'x proximity' }}>
          {items.map((p) => (
            <button
              key={p.id}
              className="flex-none w-[120px] rounded-lg overflow-hidden cursor-pointer border border-onyx-line/40 text-left"
              style={{
                background: 'rgba(19, 19, 21, 0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                scrollSnapAlign: 'start',
                transition: 'border-color 0.15s ease, transform 0.15s ease',
              }}
              onClick={() => onProductClick?.(collectionPart)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,162,74,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(35,35,38,0.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div className="h-12 w-full" style={{ background: p.color, opacity: 0.7 }} />
              <div className="px-2.5 py-2">
                <p className="text-[10.5px] font-semibold m-0 text-onyx-text truncate">{p.name}</p>
                <p className="text-[10px] text-onyx-accent mt-0.5 mb-0">{p.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}