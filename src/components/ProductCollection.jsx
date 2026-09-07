import { useMemo, useState, useEffect, useRef } from 'react'

const PART_LABELS = { frame: 'Frames', lenses: 'Lenses', sunglasses: 'Sunglasses' }
const CENTER_GROUPS = ['frame', 'lenses', 'sunglasses']
const CENTER_STAGGER_MS = 3000 // delay between each group popping up
const FADE_IN_MS = 500

function bandOpacity(p, inStart, inEnd, outStart, outEnd) {
  if (p <= inStart) return 0
  if (p < inEnd) return (p - inStart) / (inEnd - inStart)
  if (p <= outStart) return 1
  if (p < outEnd) return 1 - (p - outStart) / (outEnd - outStart)
  return 0
}

export default function ProductCollection({ activePart, products, onProductClick, variant = 'bottom', t2 = 1 }) {
  /* Real-time clock so the end-of-scroll groups reveal one every 3s.
     The interval stops itself once every card has finished fading in. */
  const startRef = useRef(Date.now())
  const [clock, setClock] = useState(Date.now())

  useEffect(() => {
    const total = CENTER_GROUPS.reduce((n, g) => n + (products[g]?.length || 0), 0)
    const end = startRef.current + total * CENTER_STAGGER_MS + FADE_IN_MS + 100
    const id = setInterval(() => {
      if (Date.now() >= end) { clearInterval(id); return }
      setClock(Date.now())
    }, 100)
    return () => clearInterval(id)
  }, [products])

  const collectionPart = useMemo(() => {
    if (activePart && activePart !== 'sunglasses') return activePart
    if (activePart === 'sunglasses') return 'sunglasses'
    return null
  }, [activePart])

  const items = collectionPart ? (products[collectionPart] || []) : []

  /* ─── Center popup (end of scroll): frames, lenses, sunglasses ── */
  if (variant === 'center') {
    // Sequence every product card across all groups, one every 3s
    let cardIndex = 0
    const groupStart = {}
    CENTER_GROUPS.forEach(partId => {
      const items = products[partId] || []
      if (items.length) groupStart[partId] = cardIndex
      cardIndex += items.length
    })

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
            {CENTER_GROUPS.map((partId) => {
              const groupItems = products[partId] || []
              if (groupItems.length === 0) return null

              // Label appears with the group's first card
              const labelReveal = startRef.current + (groupStart[partId] || 0) * CENTER_STAGGER_MS
              const labelO = Math.max(0, Math.min(1, (clock - labelReveal) / FADE_IN_MS))

              return (
                <div key={partId} className="text-center">
                  <span
                    className="text-[10px] tracking-[0.18em] uppercase text-onyx-accent font-medium"
                    style={{ opacity: labelO, transition: 'opacity 0.3s ease' }}
                  >
                    {PART_LABELS[partId] || partId}
                  </span>
                  <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth mt-2" style={{ scrollSnapType: 'x proximity' }}>
                    {groupItems.map((p, pi) => {
                      // Each card image pops in 3 seconds after the previous one
                      const reveal = startRef.current + ((groupStart[partId] || 0) + pi) * CENTER_STAGGER_MS
                      const o = Math.max(0, Math.min(1, (clock - reveal) / FADE_IN_MS))
                      return (
                        <div
                          key={p.id}
                          className="flex-none"
                          style={{
                            opacity: o,
                            transform: `translateY(${(1 - o) * 14}px)`,
                            transition: 'opacity 0.35s ease, transform 0.35s ease',
                          }}
                        >
                          <button
                            className="w-[120px] rounded-lg overflow-hidden cursor-pointer border border-onyx-line/40 text-left"
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
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="h-12 w-full object-cover block" />
                            ) : (
                              <div className="h-12 w-full" style={{ background: p.color, opacity: 0.7 }} />
                            )}
                            <div className="px-2.5 py-2">
                              <p className="text-[10.5px] font-semibold m-0 text-onyx-text truncate">{p.name}</p>
                              <p className="text-[10px] text-onyx-accent mt-0.5 mb-0">{p.price}</p>
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* Bottom strip (glasses chapter). max-sm:pr-[72px] keeps the strip clear of
     the WhatsApp bubble (46px + 16px inset + breathing room) so the last card
     is fully tappable on phones. */
  const isVisible = items.length > 0

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-[16] flex justify-center pointer-events-none px-4 pb-6 max-sm:pr-[72px]"
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
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-12 w-full object-cover block" />
              ) : (
                <div className="h-12 w-full" style={{ background: p.color, opacity: 0.7 }} />
              )}
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