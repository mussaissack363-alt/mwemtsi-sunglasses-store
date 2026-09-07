import { useMemo, useEffect, useRef } from 'react'
import { smoothstep } from '../hooks/useScrollProgress'

/* ─── Hero Starfield (scattered teal stars overlay) ───────── */
export function HeroStarfield({ t1 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || ref.current.children.length > 0) return
    const COUNT = 90
    for (let i = 0; i < COUNT; i++) {
      const s = document.createElement('div')
      s.className = 'star'
      const big = Math.random() < 0.08
      const size = big ? (2 + Math.random() * 1.5) : (0.5 + Math.random() * 1.2)
      s.style.cssText = `
        position:absolute;border-radius:50%;background:#dff3f4;
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;
        opacity:${big ? 0.7 + Math.random() * 0.3 : 0.2 + Math.random() * 0.4};
      `
      ref.current.appendChild(s)
    }
  }, [])

  const e1 = smoothstep(t1)
  // Unmount once fully faded — a fixed full-screen layer with 90 children
  // still costs compositing even at opacity 0. Remounts (and re-creates the
  // stars) if the user scrolls back up.
  if (e1 >= 0.999) return null
  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{
        opacity: Math.max(0, 1 - e1),
        background: 'radial-gradient(circle at 32% 62%, #0e5b5d 0%, #062a2c 32%, #04080a 62%, #000000 100%)',
      }}
    />
  )
}

/* ─── Scroll Hint ─────────────────────────────────────────── */
export function ScrollHint({ t1, t2 }) {
  const opacity = t2 > 0 ? 0 : t1 > 0.06 ? 0 : 1
  return (
    <div
      className="fixed left-0 right-0 bottom-10 z-10 text-center pointer-events-none"
      style={{ opacity, transition: 'opacity 0.5s ease' }}
    >
      <span className="text-[11px] tracking-[0.14em] text-onyx-muted uppercase">
        Scroll to explore
      </span>
      <span
        className="block mx-auto mt-2 w-px h-[22px]"
        style={{
          background: 'linear-gradient(#75767c, transparent)',
          animation: 'chevDrop 1.8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes chevDrop {
          0% { opacity: 0; transform: translateY(-6px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(6px); }
        }
      `}</style>
    </div>
  )
}

/* ─── Outro Line ("We keep your eyes cool.") ──────────────── */
export function OutroLine({ t1, t2 }) {
  const opacity = useMemo(() => {
    if (t2 > 0) return 0
    // Shows only at the very end of the glasses chapter, after the full rotation
    const outroRaw = t1 < 0.88 ? 0
      : t1 < 0.93 ? (t1 - 0.88) / 0.05
      : t1 < 0.94 ? 1
      : t1 < 0.99 ? 1 - (t1 - 0.94) / 0.05
      : 0
    const clearForCh2 = 1 - Math.min(1, t2 * 4)
    return outroRaw * clearForCh2
  }, [t1, t2])

  if (opacity <= 0.01) return null

  return (
    <div
      className="fixed left-0 right-0 z-[11] text-center pointer-events-none"
      style={{ top: '44%', opacity }}
    >
      <p className="m-0 text-[22px] font-medium text-onyx-text tracking-tight">
        We keep your eyes cool.
      </p>
      <p className="mt-1.5 mb-0 text-[15px] font-normal text-onyx-muted">
        Look like a celebrity.
      </p>
    </div>
  )
}

/* ─── Shop Info (location + phones, shown after glasses arrival) ── */
export function ShopInfo({ t1, t2 }) {
  const reveal = useMemo(() => {
    if (t2 > 0) return 0
    return Math.max(0, Math.min(1, (t1 - 0.80) / 0.15))
  }, [t1, t2])

  return (
    <div
      className="fixed top-6 max-sm:top-16 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none"
      style={{
        opacity: reveal,
        transition: 'opacity 0.3s ease',
        pointerEvents: reveal > 0.5 && t2 <= 0 ? 'auto' : 'none',
      }}
    >
      <div className="text-[11px] tracking-wide text-onyx-muted">Kariakoo · Open 08:00–18:00</div>
      <div className="mt-0.5 flex gap-3 justify-center">
        <a href="tel:+255753474748" className="text-[11px] text-onyx-text no-underline hover:text-onyx-accent transition-colors">
          +255 753 474 748
        </a>
        <a href="https://wa.me/255695525257" target="_blank" rel="noopener" className="text-[11px] text-onyx-muted no-underline hover:text-onyx-accent transition-colors">
          255 695 525 257
        </a>
      </div>
    </div>
  )
}

/* ─── Chapter Fade (full-viewport black overlay, z-25) ────── */
export function ChapterFade({ t2 }) {
  const opacity = useMemo(() => {
    // Quick transition at the start of the sunglasses chapter, then pure rotation
    if (t2 <= 0 || t2 >= 0.38) return 0
    if (t2 < 0.12) return 0
    if (t2 < 0.22) return (t2 - 0.12) / 0.10
    if (t2 < 0.28) return 1
    return 1 - (t2 - 0.28) / 0.10
  }, [t2])

  if (opacity <= 0.01) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 25, background: '#000', opacity }}
    />
  )
}

/* ─── Transition Words ("Same protection. Different mood.") ─ */
export function TransitionWords({ t2 }) {
  const opacity = useMemo(() => {
    if (t2 <= 0.14 || t2 >= 0.36) return 0
    const fadeIn = Math.min(1, (t2 - 0.14) / 0.06)
    const fadeOut = t2 < 0.30 ? 1 : Math.max(0, 1 - (t2 - 0.30) / 0.06)
    return fadeIn * fadeOut
  }, [t2])

  if (opacity <= 0.01) return null

  return (
    <div
      className="fixed left-0 right-0 z-[26] text-center pointer-events-none"
      style={{ top: '46%', opacity }}
    >
      <p className="m-0 text-[22px] font-medium text-onyx-text tracking-tight">
        Same protection.
      </p>
      <p className="mt-1.5 mb-0 text-[15px] font-normal text-onyx-muted">
        Different mood.
      </p>
    </div>
  )
}
