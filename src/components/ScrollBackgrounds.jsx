import { smoothstep } from '../hooks/useScrollProgress'

const clamp01 = (v) => Math.min(1, Math.max(0, v))

/* Backdrop zones for the scroll chapters.
   Set `url` to point at a photo in /public (e.g. '/bg-glasses.jpg') and it
   replaces the gradient fallback. Everything else stays the same. */
const ZONES = [
  {
    id: 'glasses',
    url: '', // e.g. '/bg-glasses.jpg'
    fallback: 'radial-gradient(120% 130% at 50% 42%, #3a3a3d 0%, #202023 38%, #0a0a0b 72%, #000000 100%)',
  },
  {
    id: 'sunglasses',
    url: '', // e.g. '/bg-sunglasses.jpg'
    fallback: 'radial-gradient(120% 130% at 55% 58%, #ffd98a 0%, #e08a3c 30%, #5b3a2a 62%, #0c0805 100%)',
  },
  {
    id: 'outro',
    url: '', // e.g. '/bg-outro.jpg' — behind the end-of-scroll products popup
    fallback: 'radial-gradient(120% 130% at 50% 45%, #0d201a 0%, #07120d 45%, #000000 100%)',
  },
]

/* Fixed backdrop layers behind the (transparent) 3D canvas:
   - glasses chapter: fades in as the hero starfield fades out (t1)
   - sunglasses chapter: fades in during the chapter transition (t2)
   - outro: fades in behind the end-of-scroll products popup (t2 → 1) */
export default function ScrollBackgrounds({ t1, t2 }) {
  const e1 = smoothstep(t1)
  const sunO = smoothstep(clamp01((t2 - 0.08) / 0.30))
  const glassesO = e1 * (1 - sunO)
  const outroO = smoothstep(clamp01((t2 - 0.62) / 0.16))

  return (
    <>
      <div
        className="fixed inset-0"
        aria-hidden="true"
        style={{
          zIndex: -1,
          opacity: glassesO,
          backgroundImage: ZONES[0].url || ZONES[0].fallback,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="fixed inset-0"
        aria-hidden="true"
        style={{
          zIndex: -1,
          opacity: sunO,
          backgroundImage: ZONES[1].url || ZONES[1].fallback,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="fixed inset-0"
        aria-hidden="true"
        style={{
          zIndex: -1,
          opacity: outroO,
          backgroundImage: ZONES[2].url || ZONES[2].fallback,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </>
  )
}