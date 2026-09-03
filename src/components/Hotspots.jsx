import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const PART_LABELS = { frame: 'Frame', lenses: 'Lenses' }

export default function Hotspots({ t1, t2, activePart, onPartClick, partObjectsRef }) {
  const [positions, setPositions] = useState({})
  const [visible, setVisible] = useState(false)
  const raf = useRef(null)
  const cameraRef = useRef(null)

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

  // Project 3D positions to screen space each frame
  useEffect(() => {
    const projVec = new THREE.Vector3()
    const box = new THREE.Box3()

    const update = () => {
      const cam = cameraRef.current
      const parts = partObjectsRef?.current
      if (!cam || !parts) {
        raf.current = requestAnimationFrame(update)
        return
      }

      const newPositions = {}
      Object.entries(parts).forEach(([id, objs]) => {
        box.copy(new THREE.Box3())
        objs.forEach((o, i) => {
          const b = new THREE.Box3().setFromObject(o)
          if (i === 0) box.copy(b); else box.union(b)
        })
        box.getCenter(projVec)
        projVec.project(cam)
        const x = (projVec.x * 0.5 + 0.5) * window.innerWidth
        const y = (-projVec.y * 0.5 + 0.5) * window.innerHeight
        newPositions[id] = { x, y, behind: projVec.z >= 1 }
      })
      setPositions(newPositions)
      raf.current = requestAnimationFrame(update)
    }

    raf.current = requestAnimationFrame(update)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [partObjectsRef])

  // Visibility — only when glasses settled and sunglasses not started
  useEffect(() => {
    const glassesSettled = t1 >= 0.999 && t2 <= 0
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
