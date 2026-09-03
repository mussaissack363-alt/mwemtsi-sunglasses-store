import { useEffect, useRef, useState } from 'react'
import { INTRO_VH, introProgress } from '../hooks/useScrollProgress'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (t) => t * t * (3 - 2 * t)

/* ─── Stylized obsidian + emerald-gradient sunglasses (front view) ─── */
function GlassesSVG({ uid }) {
  const g = (n) => `${n}-${uid}`
  return (
    <svg viewBox="0 0 680 380" className="w-full h-full block" aria-hidden="true">
      <defs>
        <linearGradient id={g('frame')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0e2b8" />
          <stop offset="0.45" stopColor="#c9a24a" />
          <stop offset="1" stopColor="#4c3d1d" />
        </linearGradient>
        <linearGradient id={g('lens')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b8ffdc" />
          <stop offset="0.35" stopColor="#00f59b" />
          <stop offset="0.72" stopColor="#0d402f" />
          <stop offset="1" stopColor="#04170f" />
        </linearGradient>
        <linearGradient id={g('sheen')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.34" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g('reflection')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* temples */}
      <g stroke={`url(#${g('frame')})`} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M66 150 Q30 148 12 132" />
        <path d="M614 150 Q650 148 668 132" />
      </g>

      {/* left lens */}
      <g>
        <rect x="62" y="96" width="236" height="188" rx="42" fill={`url(#${g('lens')})`} stroke={`url(#${g('frame')})`} strokeWidth="12" />
        <rect x="62" y="96" width="236" height="188" rx="42" fill={`url(#${g('sheen')})`} />
        <rect x="69" y="103" width="222" height="174" rx="36" fill="none" stroke="#e6c887" strokeOpacity="0.28" strokeWidth="1.5" />
        <path d="M96 132 Q152 104 216 118" stroke={`url(#${g('reflection')})`} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {/* right lens */}
      <g>
        <rect x="382" y="96" width="236" height="188" rx="42" fill={`url(#${g('lens')})`} stroke={`url(#${g('frame')})`} strokeWidth="12" />
        <rect x="382" y="96" width="236" height="188" rx="42" fill={`url(#${g('sheen')})`} />
        <rect x="389" y="103" width="222" height="174" rx="36" fill="none" stroke="#e6c887" strokeOpacity="0.28" strokeWidth="1.5" />
        <path d="M416 132 Q472 104 536 118" stroke={`url(#${g('reflection')})`} strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {/* bridge + nose pads + hinge accents */}
      <path d="M298 168 Q340 116 382 168" fill="none" stroke={`url(#${g('frame')})`} strokeWidth="12" strokeLinecap="round" />
      <path d="M298 224 Q318 240 340 228" fill="none" stroke={`url(#${g('frame')})`} strokeWidth="5" strokeLinecap="round" />
      <path d="M382 224 Q362 240 340 228" fill="none" stroke={`url(#${g('frame')})`} strokeWidth="5" strokeLinecap="round" />
      <circle cx="62" cy="150" r="6.5" fill="#e6c887" />
      <circle cx="618" cy="150" r="6.5" fill="#e6c887" />
    </svg>
  )
}

/* ─── Dashed blueprint wireframe revealed between the halves ─── */
function BlueprintWireframe() {
  return (
    <svg viewBox="0 0 400 240" className="w-[120%] h-[120%] block" aria-hidden="true">
      <g fill="none" stroke="#00f59b" strokeOpacity="0.5" strokeWidth="1">
        <circle cx="200" cy="120" r="96" strokeDasharray="3 7" />
        <circle cx="200" cy="120" r="56" strokeDasharray="1 6" strokeOpacity="0.7" />
        <rect x="120" y="44" width="160" height="152" rx="30" strokeDasharray="5 8" strokeOpacity="0.5" />
        <path d="M104 120 H296 M200 24 V216" strokeOpacity="0.35" strokeDasharray="2 6" />
      </g>
    </svg>
  )
}

export default function SplitHero() {
  const [p, setP] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : 0
  )
  const starsRef = useRef(null)

  /* progress from scroll */
  useEffect(() => {
    let raf
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setP(introProgress()))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /* emerald starlight */
  useEffect(() => {
    if (!starsRef.current || starsRef.current.children.length > 0) return
    for (let i = 0; i < 70; i++) {
      const s = document.createElement('div')
      s.className = 'star'
      const big = Math.random() < 0.08
      const size = big ? 2 + Math.random() * 1.5 : 0.5 + Math.random() * 1.1
      s.style.cssText = `
        position:absolute;border-radius:50%;
        background:${Math.random() < 0.7 ? '#c9ffe4' : '#ffffff'};
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;top:${Math.random() * 100}%;
        opacity:${big ? 0.65 + Math.random() * 0.35 : 0.15 + Math.random() * 0.35};
      `
      starsRef.current.appendChild(s)
    }
  }, [])

  if (p >= 1) return null

  /* phase drivers */
  const sp = smooth(clamp((p - 0.15) / 0.45)) // split drive 0 → 1
  const core = clamp((p - 0.22) / 0.12) * (1 - clamp((p - 0.60) / 0.14)) // core visibility
  const exit = clamp((p - 0.74) / 0.26) // overlay fade-out 0 → 1

  const X = 26 * sp // halves travel, % of container width
  const overlayO = 1 - exit

  return (
    <div
      className="fixed inset-0 z-[45] pointer-events-none"
      style={{ opacity: overlayO, background: '#030706' }}
    >
      {/* nebula glows */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 18% 18%, rgba(0,245,155,0.10), transparent 55%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 84% 86%, rgba(0,245,155,0.07), transparent 55%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 58%, rgba(0,245,155,0.055), transparent 48%)' }} />

      {/* starlight */}
      <div ref={starsRef} className="absolute inset-0 pointer-events-none" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="absolute top-0 inset-x-0 z-10 pointer-events-auto flex items-start justify-between px-6 py-6 sm:px-10"
        style={{ opacity: 1 - exit * 0.6 }}
      >
        <div className="flex flex-col gap-0.5 select-none">
          <span className="font-[Cinzel,serif] text-[15px] font-semibold tracking-[0.3em] text-[#f2f1ee] uppercase leading-none">Mwemtsi</span>
          <span className="text-[8px] font-medium tracking-[0.44em] text-[#e6c887] uppercase leading-none mt-1">Sunglasses</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#9aa7a0] hidden max-sm:block" fill="none" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <div className="relative flex items-center" title="Bag">
            <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-[#e6c887]" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="absolute -top-2 -right-2 text-[9px] font-medium text-[#e6c887]">0</span>
          </div>
          <a
            href="https://wa.me/255753474748?text=Hi%2C%20I%27m%20interested%20in%20Mwemtsi%20sunglasses"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline border border-[rgba(230,200,135,0.45)] text-[#e6c887] rounded-full px-4 py-2 text-[9.5px] tracking-[0.24em] uppercase hover:bg-[rgba(230,200,135,0.09)] transition-colors"
          >
            Concierge
          </a>
        </div>
      </header>

      {/* ── Eyebrow ────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 text-center"
        style={{ top: '16vh', transform: `translateY(${-10 * sp}px)`, opacity: 1 - exit }}
      >
        <span className="inline-flex items-center gap-3 text-[9.5px] tracking-[0.3em] uppercase font-mono text-[#9aa7a0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f59b]" style={{ boxShadow: '0 0 8px 1px rgba(0,245,155,0.8)' }} />
          Limited Atelier Series — 004 // 250 crafted globally
        </span>
      </div>

      {/* ── Headline ───────────────────────────────────────────── */}
      <div className="absolute inset-x-0 text-center" style={{ top: '21.5vh', transform: `translateY(${-14 * sp}px)`, opacity: 1 - exit * 0.85 }}>
        <h1 className="m-0" style={{ fontFamily: 'Cinzel, serif' }}>
          <span className="block text-[clamp(22px,4vw,48px)] tracking-[0.08em] text-[#f2f1ee] leading-tight">Engineered in the dark.</span>
          <span
            className="block italic mt-2 leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(28px,4.6vw,58px)',
              background: 'linear-gradient(100deg, #00f59b 8%, #b8ffdc 38%, #e6c887 72%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Defined by the light.
          </span>
        </h1>
      </div>

      {/* ── Split glasses ──────────────────────────────────────── */}
      <div
        className="absolute left-1/2"
        style={{
          top: '50%',
          width: 'min(64vw, 600px)',
          aspectRatio: '680 / 380',
          transform: `translate(-50%, calc(-50% - ${8 * sp + 46 * exit}px)) scale(${1 - 0.06 * exit})`,
        }}
      >
        {/* blueprint wireframe behind the seam */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: core * 0.8, transform: `scale(${0.92 + 0.08 * core})` }}
        >
          <BlueprintWireframe />
        </div>

        {/* left half */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            clipPath: 'polygon(0% 0%, 50.2% 0%, 50.2% 100%, 0% 100%)',
            transform: `translate3d(${-X}%, ${-15 * sp}px, 0) rotate(${-7 * sp}deg)`,
          }}
        >
          <GlassesSVG uid="left" />
        </div>

        {/* right half */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            clipPath: 'polygon(49.8% 0%, 100% 0%, 100% 100%, 49.8% 100%)',
            transform: `translate3d(${X}%, ${15 * sp}px, 0) rotate(${7 * sp}deg)`,
          }}
        >
          <GlassesSVG uid="right" />
        </div>

        {/* glowing emerald core line */}
        <div
          className="absolute top-[4%] bottom-[4%] pointer-events-none"
          style={{
            left: '50%',
            width: 1.5,
            opacity: core,
            background: 'linear-gradient(transparent, #00f59b 30%, #b8ffdc 50%, #00f59b 70%, transparent)',
            boxShadow: '0 0 10px 1px rgba(0,245,155,0.6), 0 0 60px 10px rgba(0,245,155,0.28)',
          }}
        />

        {/* technical breakdown labels */}
        <div
          className="absolute top-1/2 -translate-y-1/2 text-right pointer-events-none"
          style={{
            left: `calc(50% - ${X}% - 48px)`,
            opacity: core * 0.95,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          <div className="text-[9px] tracking-[0.22em] text-[#00f59b] uppercase whitespace-nowrap">Titanium hinge</div>
          <div className="text-[8.5px] tracking-[0.14em] text-[#8f9a94] uppercase whitespace-nowrap mt-1">0.04mm hand-buffed</div>
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 text-left pointer-events-none"
          style={{
            left: `calc(50% + ${X}% + 48px)`,
            opacity: core * 0.95,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          <div className="text-[9px] tracking-[0.22em] text-[#00f59b] uppercase whitespace-nowrap">UV400 polarized</div>
          <div className="text-[8.5px] tracking-[0.14em] text-[#8f9a94] uppercase whitespace-nowrap mt-1">9-layer emerald optics</div>
        </div>
      </div>

      {/* ── Subcopy ────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 text-center px-6"
        style={{ top: '70vh', transform: `translateY(${-8 * sp}px)`, opacity: (1 - 0.4 * sp) * (1 - exit) }}
      >
        <p className="m-0 mx-auto max-w-[540px] text-[13px] leading-relaxed text-[#9aa7a0] tracking-[0.02em]">
          Aerospace-grade Japanese titanium paired with cosmic polarized emerald gradient optics.
          Designed for those who perceive what remains unseen.
        </p>
      </div>

      {/* ── Technical specs row ────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-[14vh] flex flex-wrap justify-center items-center gap-x-7 gap-y-2 px-6"
        style={{ opacity: (1 - 0.75 * sp) * (1 - exit) }}
      >
        {[
          ['0.04mm', 'Hand-buffed titanium'],
          ['100%', 'UV400 polarized gradient'],
          ['28g', 'Ultralight zero-fatigue'],
          ['N°', 'Vault bespoke keepsake'],
        ].map(([num, label], i, arr) => (
          <div key={label} className="flex items-center gap-7">
            <div className="text-center">
              <div className="text-[11px] tracking-[0.18em] uppercase font-mono text-[#e6c887]">{num}</div>
              <div className="mt-1 text-[8.5px] tracking-[0.16em] uppercase text-[#8f9a94]">{label}</div>
            </div>
            {i < arr.length - 1 && <span className="hidden sm:block w-px h-7 bg-white/10" />}
          </div>
        ))}
      </div>

      {/* ── Scroll hint ────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-[4.5vh] text-center pointer-events-none"
        style={{ opacity: 1 - smooth(clamp((p - 0.42) / 0.22)) }}
      >
        <span className="text-[9.5px] tracking-[0.36em] uppercase font-mono text-[#8f9a94]">Scroll to explore</span>
        <span
          className="block mx-auto mt-2.5 w-px h-[22px]"
          style={{
            background: 'linear-gradient(#00f59b, transparent)',
            boxShadow: '0 0 8px 0 rgba(0,245,155,0.6)',
            animation: 'splitChevDrop 1.8s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes splitChevDrop {
            0% { opacity: 0; transform: translateY(-6px); }
            50% { opacity: 1; }
            100% { opacity: 0; transform: translateY(6px); }
          }
        `}</style>
      </div>
    </div>
  )
}