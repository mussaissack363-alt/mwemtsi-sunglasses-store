import { useState, useEffect, useCallback, useRef } from 'react'

const CH1_END = 0.5 // even split — each model gets the same long, slow rotation

/* Split-in-half intro hero: occupies the first INTRO_VH of scroll before the
   3D journey starts, so the existing experience plays unchanged afterward. */
export const INTRO_VH = 140

export function introProgress() {
  const introPx = (INTRO_VH / 100) * window.innerHeight
  return Math.min(1, Math.max(0, window.scrollY / introPx))
}

export function useScrollProgress(spacerRef) {
  const [progress, setProgress] = useState(0)
  const [t1, setT1] = useState(0)
  const [t2, setT2] = useState(0)
  const raf = useRef(null)

  const update = useCallback(() => {
    if (!spacerRef.current) return
    const introPx = (INTRO_VH / 100) * window.innerHeight
    const max = spacerRef.current.scrollHeight - window.innerHeight
    if (max <= 0) { setProgress(1); setT1(1); setT2(0); return }
    const rawT = Math.min(1, Math.max(0, (window.scrollY - introPx) / Math.max(1, max - introPx)))
    setProgress(rawT)
    setT1(Math.min(1, rawT / CH1_END))
    setT2(Math.max(0, Math.min(1, (rawT - CH1_END) / (1 - CH1_END))))
  }, [spacerRef])

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [update])

  return { progress, t1, t2, CH1_END }
}

export function smoothstep(t) {
  return t * t * (3 - 2 * t)
}
