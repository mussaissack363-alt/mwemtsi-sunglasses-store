import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as THREE from 'three'

/* ─── Part node mapping ───────────────────────────────────── */
const PART_NODES = { frame: ['Frame_1', 'Handles_2'], lenses: ['Glasses_3'] }

/* ─── Gradient backdrop textures ──────────────────────────── */
function makeGradientTexture(stops, size = 512) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const grad = ctx.createRadialGradient(size * 0.5, size * 0.55, size * 0.05, size * 0.5, size * 0.55, size * 0.75)
  stops.forEach(([offset, color]) => grad.addColorStop(offset, color))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const studioBgTexture = makeGradientTexture([[0, '#3a3a3d'], [0.45, '#1c1c1f'], [1, '#000000']])
const sunnyBgTexture = makeGradientTexture([[0, '#ffd98a'], [0.35, '#e08a3c'], [0.7, '#5b3a2a'], [1, '#0c0805']])

/* ─── Tint presets for frame / lens inspection ────────────── */
const NEUTRAL_TINT = {
  key: { color: new THREE.Color(0xffffff), intensity: 2.3 },
  fill: { color: new THREE.Color(0xbcd0ff), intensity: 0.7 },
  rim: { color: new THREE.Color(0xffe9c2), intensity: 1.3 },
  ambient: { color: new THREE.Color(0xffffff), intensity: 0.25 },
}
const FRAME_TINT = {
  key: { color: new THREE.Color(0xffe3b0), intensity: 2.6 },
  fill: { color: new THREE.Color(0xbcd0ff), intensity: 0.6 },
  rim: { color: new THREE.Color(0xffb15c), intensity: 1.9 },
  ambient: { color: new THREE.Color(0xffdba0), intensity: 0.32 },
}
const LENS_TINT = {
  key: { color: new THREE.Color(0xdfeeff), intensity: 2.1 },
  fill: { color: new THREE.Color(0x9fc4ff), intensity: 0.9 },
  rim: { color: new THREE.Color(0x8fd0ff), intensity: 1.6 },
  ambient: { color: new THREE.Color(0xbfe0ff), intensity: 0.28 },
}

/* ─── Shared normalize-and-fit helper ─────────────────────── */
function normalizeAndFit(root, camera, farMul) {
  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3(); box.getSize(size)
  const center = new THREE.Vector3(); box.getCenter(center)
  root.position.sub(center)

  const maxDim = Math.max(size.x, size.y, size.z)
  root.scale.setScalar(1.5 / maxDim)

  const box2 = new THREE.Box3().setFromObject(root)
  const size2 = new THREE.Vector3(); box2.getSize(size2)
  const fitDist = (Math.max(size2.x, size2.y, size2.z) / 2)
    / Math.tan((camera.fov * Math.PI / 180) / 2) * 1.7

  return {
    defaultCamPos: new THREE.Vector3(0, 0, fitDist),
    farCamPos: new THREE.Vector3(fitDist * farMul.x, fitDist * farMul.y, fitDist * farMul.z),
  }
}

function unionBox(objs) {
  const box = new THREE.Box3()
  objs.forEach((o, i) => {
    const b = new THREE.Box3().setFromObject(o)
    if (i === 0) box.copy(b); else box.union(b)
  })
  return box
}

/* ─── Inner scene ─────────────────────────────────────────── */
function SceneInner({ t1, t2, activePart, onModelReady, onHotspotsReady, requestResetView }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const keyRef = useRef()
  const fillRef = useRef()
  const rimRef = useRef()
  const ambRef = useRef()
  const animRef = useRef(null)
  const resetRequested = useRef(false)

  const [modelSwappedToSun, setModelSwappedToSun] = useState(false)

  /* ---- Load glasses model ---- */
  const { scene: glassesScene } = useGLTF('/glasses(1).glb')
  const modelRoot = useMemo(() => glassesScene, [glassesScene])

  /* ---- Load sunglasses model ---- */
  const [sunModelRoot, setSunModelRoot] = useState(null)

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.load('/sun_glasses.glb', (gltf) => {
      gltf.scene.visible = false
      setSunModelRoot(gltf.scene)
    }, undefined, () => {})
  }, [])

  /* ---- Part objects ---- */
  const partObjects = useMemo(() => {
    const objs = {}
    Object.entries(PART_NODES).forEach(([id, names]) => {
      const found = names.map(n => modelRoot.getObjectByName(n)).filter(Boolean)
      if (found.length) objs[id] = found
    })
    return objs
  }, [modelRoot])

  /* ---- Framing ---- */
  const framing = useMemo(() => {
    const glassesFit = normalizeAndFit(modelRoot, camera, { x: 1.9, y: 0.55, z: 1.6 })
    let sunFraming = null
    if (sunModelRoot) {
      const sunFit = normalizeAndFit(sunModelRoot, camera, { x: -1.7, y: 0.5, z: 1.8 })
      sunFraming = { defaultCamPos: sunFit.defaultCamPos, farCamPos: sunFit.farCamPos, defaultTarget: new THREE.Vector3(0, 0, 0) }
    }
    return {
      glasses: glassesFit,
      defaultTarget: new THREE.Vector3(0, 0, 0),
      sun: sunFraming,
    }
  }, [modelRoot, camera, sunModelRoot])

  /* ---- Compute focus camera pos for a part ---- */
  const computeFocusPos = useCallback((partId) => {
    const targets = partObjects[partId]
    if (!targets) return null
    const box = unionBox(targets)
    const center = new THREE.Vector3(); box.getCenter(center)
    const size = new THREE.Vector3(); box.getSize(size)
    const radius = Math.max(size.x, size.y, size.z, 0.05)
    const dist = radius / Math.tan((camera.fov * Math.PI / 180) / 2) * 1.35
    const dir = camera.position.clone().sub(controlsRef.current.target).normalize()
    return { pos: center.clone().add(dir.multiplyScalar(dist)), target: center }
  }, [partObjects, camera])

  /* ---- Animate camera helper ---- */
  const animateCamera = useCallback((toPos, toTarget, duration) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const fromPos = camera.position.clone()
    const fromTarget = controlsRef.current.target.clone()
    const start = performance.now()
    controlsRef.current.enabled = false
    function step(now) {
      const t = Math.min(1, (now - start) / duration)
      const e = 1 - Math.pow(1 - t, 3) // cubic ease-out
      camera.position.lerpVectors(fromPos, toPos, e)
      controlsRef.current.target.lerpVectors(fromTarget, toTarget, e)
      controlsRef.current.update()
      if (t < 1) animRef.current = requestAnimationFrame(step)
      else controlsRef.current.enabled = true
    }
    animRef.current = requestAnimationFrame(step)
  }, [camera])

  /* ---- Respond to activePart changes (focus / reset) ---- */
  useEffect(() => {
    // During the sunglasses chapter the glasses model is hidden — keep the camera on the sun model
    if (activePart && activePart !== 'sunglasses' && t2 < 0.3) {
      const focus = computeFocusPos(activePart)
      if (focus) animateCamera(focus.pos, focus.target, 550)
    }
  }, [activePart, computeFocusPos, animateCamera, t2])

  /* ---- Respond to reset request from parent ---- */
  useEffect(() => {
    if (requestResetView > 0) {
      animateCamera(framing.glasses.defaultCamPos, framing.defaultTarget, 600)
    }
  }, [requestResetView, animateCamera, framing])

  /* ---- Raycaster for model clicks ---- */
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])

  useEffect(() => {
    const onPointerDown = (e) => {
      if (t2 > 0 || activePart) return
      const glassesSettled = t1 >= 0.999
      if (!glassesSettled) return
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(modelRoot, true)
      if (hits.length > 0) {
        let obj = hits[0].object
        while (obj && !obj.userData.partId) obj = obj.parent
        if (obj?.userData.partId) onHotspotsReady?.(obj.userData.partId)
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [camera, modelRoot, raycaster, pointer, t1, t2, activePart, onHotspotsReady])

  /* ---- Tag part meshes ---- */
  useEffect(() => {
    const nodeToPart = {}
    Object.entries(PART_NODES).forEach(([id, names]) => names.forEach(n => nodeToPart[n] = id))
    modelRoot.traverse((child) => {
      if (child.isMesh) {
        let p = child
        while (p && !p.userData.partId) {
          if (nodeToPart[p.name]) p.userData.partId = nodeToPart[p.name]
          p = p.parent
        }
      }
    })
    if (sunModelRoot) sunModelRoot.visible = false
    onModelReady?.()
  }, [modelRoot, sunModelRoot, onModelReady])

  useEffect(() => {
    if (Object.keys(partObjects).length) onHotspotsReady?.(null, partObjects)
  }, [partObjects, onHotspotsReady])

  /* ---- Per-frame update ---- */
  useFrame(() => {
    if (!controlsRef.current) return

    const e1 = t1 * t1 * (3 - 2 * t1)

    /* Chapter 1: glasses scroll drift */
    if (t2 <= 0 && !activePart) {
      camera.position.lerpVectors(framing.glasses.farCamPos, framing.glasses.defaultCamPos, e1)
      controlsRef.current.target.lerpVectors(framing.defaultTarget, framing.defaultTarget, e1)
    }

    /* Tint during part inspection */
    const isInspectingFrame = activePart === 'frame'
    const isInspectingLens = activePart === 'lenses'
    applyTint(keyRef.current, fillRef.current, rimRef.current, ambRef.current,
      isInspectingFrame ? 1 : 0, isInspectingLens ? 1 : 0)

    /* Model swap at t2 >= 0.30 */
    const showSun = t2 >= 0.30
    if (showSun && modelRoot.visible) {
      modelRoot.visible = false
      if (sunModelRoot) sunModelRoot.visible = true
      setModelSwappedToSun(true)
    } else if (!showSun && modelSwappedToSun) {
      modelRoot.visible = true
      if (sunModelRoot) sunModelRoot.visible = false
      setModelSwappedToSun(false)
    }

    /* Chapter 2: sunglasses camera drift */
    if (sunModelRoot && framing.sun && t2 >= 0.30) {
      const t2drift = Math.max(0, Math.min(1, (t2 - 0.65) / 0.35))
      const e2 = t2drift * t2drift * (3 - 2 * t2drift)
      camera.position.lerpVectors(framing.sun.farCamPos, framing.sun.defaultCamPos, e2)
      controlsRef.current.target.lerpVectors(framing.sun.defaultTarget, framing.sun.defaultTarget, e2)
    }

    /* Controls enabled */
    const glassesSettled = t1 >= 0.999 && t2 <= 0.001
    const sunSettled = t2 >= 0.999
    controlsRef.current.enabled = glassesSettled || sunSettled

    controlsRef.current.update()
  })

  return (
    <>
      <directionalLight ref={keyRef} position={[2, 2, 3]} intensity={2.3} />
      <directionalLight ref={fillRef} position={[-3, 0.5, 1]} intensity={0.7} color={0xbcd0ff} />
      <directionalLight ref={rimRef} position={[0, 2, -3]} intensity={1.3} color={0xffe9c2} />
      <ambientLight ref={ambRef} intensity={0.25} />
      <group>
        <primitive object={modelRoot} />
        {sunModelRoot && <primitive object={sunModelRoot} />}
      </group>
      <OrbitControls
        ref={controlsRef}
        enableDamping dampingFactor={0.08}
        minDistance={0.05} maxDistance={8}
        enablePan={false} enableZoom={false}
        enabled={false}
      />
    </>
  )
}

function applyTint(key, fill, rim, amb, frameW, lensW) {
  function mix(field, sub) {
    const base = NEUTRAL_TINT[field][sub]
    const toFrame = FRAME_TINT[field][sub]
    const toLens = LENS_TINT[field][sub]
    if (sub === 'color') return base.clone().lerp(toFrame, frameW).lerp(toLens, lensW)
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(base, toFrame, frameW), toLens, lensW)
  }
  key.color.copy(mix('key', 'color'));     key.intensity = mix('key', 'intensity')
  fill.color.copy(mix('fill', 'color'));   fill.intensity = mix('fill', 'intensity')
  rim.color.copy(mix('rim', 'color'));     rim.intensity = mix('rim', 'intensity')
  amb.color.copy(mix('ambient', 'color')); amb.intensity = mix('ambient', 'intensity')
}

/* ─── Exported wrapper ────────────────────────────────────── */
export default function Scene({ t1, t2, activePart, onModelReady, onPartClick, requestResetView }) {
  const handleHotspot = (partId) => {
    if (partId) onPartClick?.(partId)
  }

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ fov: 35, near: 0.01, far: 100, position: [0, 0, 5] }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace }}
      >
        <SceneInner
          t1={t1} t2={t2}
          activePart={activePart}
          onModelReady={onModelReady}
          onHotspotsReady={handleHotspot}
          requestResetView={requestResetView}
        />
      </Canvas>
    </div>
  )
}
