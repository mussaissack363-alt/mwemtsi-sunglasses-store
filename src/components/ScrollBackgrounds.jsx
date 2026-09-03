import { smoothstep } from '../hooks/useScrollProgress'
import CommercialBackdrop from './CommercialBackdrop'

const clamp01 = (v) => Math.min(1, Math.max(0, v))

/* Fixed backdrop layers behind the (transparent) 3D canvas:
   - glasses chapter: fades in as the hero starfield fades out (t1)
   - sunglasses chapter: fades in during the chapter transition (t2)
   - outro: fades in behind the end-of-scroll products popup */
export default function ScrollBackgrounds({ t1, t2 }) {
  const e1 = smoothstep(t1)
  const sunO = smoothstep(clamp01((t2 - 0.05) / 0.23))
  const glassesO = e1 * (1 - sunO)
  const outroO = smoothstep(clamp01((t2 - 0.86) / 0.12))

  return (
    <>
      {/* Glasses chapter — warm dusk commercial stage */}
      <div className="fixed inset-0" aria-hidden="true" style={{ zIndex: -1, opacity: glassesO }}>
        <CommercialBackdrop />
      </div>
      {/* Sunglasses chapter — same golden-hour world, slightly hotter */}
      <div className="fixed inset-0" aria-hidden="true" style={{ zIndex: -1, opacity: sunO }}>
        <CommercialBackdrop hot />
      </div>
      {/* Outro — behind the end-of-scroll products popup */}
      <div
        className="fixed inset-0"
        aria-hidden="true"
        style={{
          zIndex: -1,
          opacity: outroO,
          backgroundImage: 'radial-gradient(120% 130% at 50% 45%, #2a1a18 0%, #140c0c 45%, #000000 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </>
  )
}