import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const PART_LABELS = { frame: 'Frame', lenses: 'Lenses' }

export default function Hotspots({ t1, t2, activePart, onPartClick, partObjectsRef }) {
  const [positions, setPositions] = useState({})
  const [visible, setVisible] = useState(false)
  const raf = useRef(null)
  const cameraRef = useRef(null)
  const lastPositions = useRef({})
  const scratchBox = useRef(null)
  const projVec = useRef(null)

  // Get camera from R3F store
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const check = setInterval(() => {
      if (canvas.__r3f?.store) {
        cameraRef.current = canvas.__r3f.store.getState().camera
        clearInterval(check)
      }
    }, 100)
    return () => clearInterval(check)
  }, [])

  // Project 3D positions to screen space each frame — only while visible.
  // (A permanent rAF loop here burned battery even when hotspots were hidden.)
  // React state only updates when a pill actually moves >1px or its
  // behind-camera flag flips, so we don't re-render 60×/s while nothing changes.
  useEffect(() => {
    if (!visible) return

    if (!scratchBox.current) scratchBox.current = new THREE.Box3()
    if (!projVec.current) projVec.current = new THREE.Vector3()

    const update = () => {
      const cam = cameraRef.current
      const parts = partObjectsRef?.current
      if (!cam || !parts) {
        raf.current = requestAnimationFrame(update)
        return
      }

      const box = scratchBox.current
      const w = window.innerWidth
      const h = window.innerHeight
      let changed = false
      const newPositions = {}
      Object.entries(parts).forEach(([id, objs]) => {
        box.makeEmpty()
        objs.forEach((o) => box.expandByObject(o))
        box.getCenter(projVec.current)
        projVec.current.project(cam)
        const x = (projVec.current.x * 0.5 + 0.5) * w
        const y = (-projVec.current.y * 0.5 + 0.5) * h
        const behind = projVec.current.z >= 1
        const prev = lastPositions.current[id]
        if (!prev || prev.behind !== behind || Math.abs(prev.x - x) > 1 || Math.abs(prev.y - y) > 1) {
          newPositions[id] = { x, y, behind }
          changed = true
        } else {
          newPositions[id] = prev
        }
      })
      if (changed) {
        lastPositions.current = newPositions
        setPositions(newPositions)
      }
      raf.current = requestAnimationFrame(update)
    }

    raf.current = requestAnimationFrame(update)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [partObjectsRef, visible])

  // Visibility — only after the glasses rotation completes (t1 >= 0.86)
  useEffect(() => {
    const glassesSettled = t1 >= 0.86 && t2 <= 0
    setVisible(glassesSettled && !activePart)
  }, [t1, t2, activePart])

  return (
    <>
      {Object.entries(PART_LABELS).map(([id, label]) => {
        const pos = positions[id]
        if (!pos || pos.behind) return null

        return (
          <div
            key={id}
            className="fixed z-[15] cursor-pointer flex items-center gap-[7px]"
            style={{
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              opacity: visible ? 1 : 0,
              pointerEvents: visible ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }}
            onClick={() => onPartClick(id)}
            role="button"
            tabIndex={visible ? 0 : -1}
            aria-label={`View ${label} products`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPartClick(id) }
            }}
          >
            <span
              className="w-2 h-2 rounded-full bg-onyx-accent shrink-0"
              style={{
                boxShadow: '0 0 0 4px rgba(201,162,74,0.15)',
                animation: 'pulse 2.2s ease-in-out infinite',
              }}
            />
            <span
              className={`hotspot-pill ${activePart === id ? 'border-onyx-accent text-onyx-accent' : ''}`}
            >
              {label}
            </span>
          </div>
        )
      })}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(201,162,74,0.15); }
          50% { box-shadow: 0 0 0 9px rgba(201,162,74,0.05); }
        }
      `}</style>
    </>
  )
}
