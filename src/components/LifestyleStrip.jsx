import { useMemo, useState, useEffect, useRef } from 'react'

const LIFE_CARDS = [
  { id: 'life-1', img: '/lifestyle-1.jpg', alt: 'Eyewear lifestyle', caption: 'We care for your vision' },
  { id: 'life-2', img: '/lifestyle-2.jpg', alt: 'Customer service', caption: 'Excellent service, every time' },
  { id: 'life-3', img: '/lifestyle-3.jpg', alt: 'Availability', caption: 'Always available for you' },
]

const STAGGER_MS = 3000 // guaranteed delay between each photo appearing
const FADE_IN_MS = 500
const HOLD_MS = 4000 // how long each photo stays up to be read
const FADE_OUT_MS = 500

export default function LifestyleStrip({ t1, t2 }) {
  // First clock moment each card became scroll-eligible (null = not reached yet)
  const eligible = useRef([null, null, null])
  const [clock, setClock] = useState(Date.now())

  /* Record when each card's scroll threshold is first crossed */
  useEffect(() => {
    LIFE_CARDS.forEach((_, i) => {
      const threshold = 0.84 + i * 0.05
      if (eligible.current[i] == null && t1 >= threshold) {
        eligible.current[i] = Date.now()
      }
    })
  }, [t1])

  /* Tick the clock while the strip is active so the sequence runs in real time */
  useEffect(() => {
    if (t2 > 0 || t1 < 0.8) return
    const id = setInterval(() => setClock(Date.now()), 100)
    return () => clearInterval(id)
  }, [t1, t2])

  /* Effective reveal time per card: scroll-eligible time, but never sooner
     than 3s after the previous card appeared */
  const reveals = useMemo(() => {
    const out = []
    let prevReveal = -Infinity
    for (let i = 0; i < LIFE_CARDS.length; i++) {
      const elig = eligible.current[i]
      const reveal = elig == null ? Infinity : Math.max(elig, prevReveal + STAGGER_MS)
      out.push(reveal)
      prevReveal = reveal
    }
    return out
  }, [clock]) // eslint-disable-line react-hooks/exhaustive-deps

  if (t2 > 0) return null

  return (
    <div
      className="fixed left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center gap-5 z-[11] pointer-events-none px-6 max-sm:gap-2.5 max-sm:px-4"
      style={{ transition: 'opacity 0.3s ease' }}
    >
      {LIFE_CARDS.map((card, i) => {
        const inStart = 0.84 + i * 0.05

        // Scroll gate: hidden until its scroll position is reached; hidden at chapter end
        const scrollIn = t1 <= inStart ? 0 : Math.min(1, (t1 - inStart) / 0.06)
        const scrollOut = t1 >= 0.999 ? 0 : 1

        // Time sequence: fade in at reveal, hold, then fade out on its own
        const reveal = reveals[i]
        const since = clock - reveal
        const timeIn = reveal === Infinity ? 0 : Math.max(0, Math.min(1, since / FADE_IN_MS))
        const timeOut = reveal === Infinity ? 0
          : Math.max(0, Math.min(1, (HOLD_MS + FADE_OUT_MS - since) / FADE_OUT_MS))

        const opacity = scrollIn * scrollOut * timeIn * timeOut

        return (
          <div
            key={card.id}
            className="w-[210px] max-sm:w-[30vw] transition-transform duration-300"
            style={{
              opacity,
              transform: `translateY(${(1 - opacity) * 14}px)`,
            }}
          >
            <img
              src={card.img}
              alt={card.alt}
              className="w-full h-[260px] max-sm:h-[36vw] object-cover rounded block"
              style={{ filter: 'grayscale(0.15) contrast(1.05)' }}
              loading="lazy"
            />
            <p className="mt-2.5 mb-0 text-[12.5px] max-sm:text-[10px] text-onyx-text text-center tracking-wide">
              {card.caption}
            </p>
          </div>
        )
      })}
    </div>
  )
}