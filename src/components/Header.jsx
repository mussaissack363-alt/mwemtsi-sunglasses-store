import { useEffect, useRef } from 'react'

export function Logo() {
  const ref = useRef()

  useEffect(() => {
    const onMove = (e) => {
      if (!ref.current) return
      const nx = (e.clientX / window.innerWidth - 0.5) * 6
      ref.current.style.marginLeft = nx + 'px'
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <header>
      <div
        ref={ref}
        className="fixed top-[22px] left-6 z-20 flex flex-col items-start gap-0.5 pointer-events-none select-none origin-left"
        style={{ animation: 'idleFloat 5.5s ease-in-out infinite' }}
        aria-label="Mwemtsi Sunglasses"
      >
        <span className="text-sm font-semibold tracking-[0.16em] text-onyx-text uppercase">Mwemtsi</span>
        <span className="text-[9px] font-medium tracking-[0.32em] text-onyx-accent uppercase">Sunglasses</span>
      </div>
      <style>{`
        @keyframes idleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-0.6deg); }
        }
      `}</style>
    </header>
  )
}

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/255753474748?text=Hi%2C%20I%27m%20interested%20in%20Mwemtsi%20sunglasses"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-6 bottom-6 z-20 w-[52px] h-[52px] rounded-full bg-onyx-wa flex items-center justify-center shadow-lg no-underline transition-transform hover:scale-105 active:scale-[0.97] max-sm:right-4 max-sm:bottom-4 max-sm:w-[46px] max-sm:h-[46px]"
    >
      <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-white max-sm:w-[22px] max-sm:h-[22px]" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.09-4.85-4.28-.14-.19-1.16-1.55-1.16-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.2.68-.79.86-1.06.18-.28.36-.23.61-.14.24.09 1.55.73 1.82.87.27.13.44.2.51.31.07.12.07.68-.17 1.35z" />
      </svg>
    </a>
  )
}
