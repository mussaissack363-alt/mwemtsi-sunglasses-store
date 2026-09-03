import { useMemo } from 'react'

const LIFE_CARDS = [
  { id: 'life-1', img: '/lifestyle-1.jpg', alt: 'Eyewear lifestyle', caption: 'We care for your vision' },
  { id: 'life-2', img: '/lifestyle-2.jpg', alt: 'Customer service', caption: 'Excellent service, every time' },
  { id: 'life-3', img: '/lifestyle-3.jpg', alt: 'Availability', caption: 'Always available for you' },
]

function bandOpacity(p, inStart, inEnd, outStart, outEnd) {
  if (p <= inStart) return 0
  if (p < inEnd) return (p - inStart) / (inEnd - inStart)
  if (p <= outStart) return 1
  if (p < outEnd) return 1 - (p - outStart) / (outEnd - outStart)
  return 0
}

export default function LifestyleStrip({ t1, t2 }) {
  // Photos visible during t1 ~0.65 to 0.95, hidden during sunglasses chapter
  if (t2 > 0) return null

  return (
    <div
      className="fixed left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center gap-5 z-[11] pointer-events-none px-6 max-sm:gap-2.5 max-sm:px-4"
      style={{ transition: 'opacity 0.3s ease' }}
    >
      {LIFE_CARDS.map((card, i) => {
        const inStart = 0.65 + i * 0.05
        const inEnd = inStart + 0.10
        const outStart = 0.88
        const outEnd = 0.95
        const opacity = bandOpacity(t1, inStart, inEnd, outStart, outEnd)

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
