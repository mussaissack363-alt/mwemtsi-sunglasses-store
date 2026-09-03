import { useMemo } from 'react'

// Generate deterministic star positions
function generateStars(count, seed = 42) {
  const stars = []
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      size: rand() < 0.92 ? 1 + rand() * 1.5 : 2 + rand() * 2, // 92% tiny, 8% bright
      opacity: rand() < 0.92 ? 0.3 + rand() * 0.5 : 0.7 + rand() * 0.3,
      animDelay: rand() * 6,
    })
  }
  return stars
}

export default function Starfield({ progress, HERO_END }) {
  const stars = useMemo(() => generateStars(120), [])

  // Fade out as scroll progresses past hero
  const opacity = progress <= HERO_END
    ? Math.max(0, 1 - (progress / HERO_END) * 1.2)
    : 0

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Radial gradient: deep teal/cyan center-left → near-black edges */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 35% 45%, rgba(0,80,90,0.35) 0%, rgba(0,40,50,0.15) 40%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* Star dots */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="white"
            opacity={star.opacity}
          >
            <animate
              attributeName="opacity"
              values={`${star.opacity};${star.opacity * 0.4};${star.opacity}`}
              dur={`${3 + star.animDelay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  )
}
