import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, RoundedBox, Environment, Lightformer } from '@react-three/drei'
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

/* ─── Travertine plinth texture ───────────────────────────── */
function makeTravertineTexture(size = 512) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')

  // Warm cream base
  ctx.fillStyle = '#e9ddc6'
  ctx.fillRect(0, 0, size, size)

  // Soft blotchy mottling
  for (let i = 0; i < 160; i++) {
    const x = Math.random() * size, y = Math.random() * size
    const r = 3 + Math.random() * 26
    const tone = 0.8 + Math.random() * 0.25
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${212 * tone | 0}, ${196 * tone | 0}, ${166 * tone | 0}, 0.5)`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }

  // Travertine pores / vugs
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size, y = Math.random() * size
    const r = 0.5 + Math.random() * 2.4
    ctx.fillStyle = `rgba(120, 100, 75, ${0.12 + Math.random() * 0.28})`
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }

  // Subtle horizontal veining
  for (let i = 0; i < 26; i++) {
    const y = Math.random() * size
    ctx.strokeStyle = `rgba(150, 128, 100, ${0.04 + Math.random() * 0.06})`
    ctx.lineWidth = 0.5 + Math.random() * 1.6
    ctx.beginPath(); ctx.moveTo(0, y)
    ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 6, size * 0.7, y + (Math.random() - 0.5) * 6, size, y + (Math.random() - 0.5) * 4)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/* ─── Palm leaf shadow cookie ─────────────────────────────── */
function makePalmTexture(size = 512) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const cx = size / 2, cy = size / 2

  function frond(angle, len, curve) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    // Curved spine
    ctx.strokeStyle = 'rgba(12, 7, 3, 0.85)'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(len * 0.45, -curve, len, curve * 0.3)
    ctx.stroke()
    // Leaflets fanning along the spine
    ctx.lineWidth = 3.4
    for (let t = 0.12; t <= 0.98; t += 0.1) {
      const x = len * t
      const y = 2 * (1 - t) * t * (-curve) + t * t * curve * 0.3
      ctx.strokeStyle = `rgba(12, 7, 3, ${0.5 + Math.random() * 0.35})`
      ctx.beginPath(); ctx.moveTo(x, y)
      ctx.lineTo(x + 15, y - 9); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x, y)
      ctx.lineTo(x + 13, y + 9); ctx.stroke()
    }
    ctx.restore()
  }

  ctx.clearRect(0, 0, size, size)
  frond(0, 185, 30)
  frond(Math.PI * 0.22, 175, 34)
  frond(Math.PI * 0.45, 190, -30)
  frond(Math.PI * 0.7, 170, 32)
  frond(Math.PI * 0.9, 182, -28)
  frond(Math.PI * 1.12, 168, 30)
  frond(Math.PI * 1.38, 180, -32)
  frond(Math.PI * 1.62, 172, 28)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

/* ─── Soft reflective floor (radial fade to transparent) ─── */
function makeFloorTexture(size = 512) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.42)')
  g.addColorStop(0.78, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

const plinthTexture = makeTravertineTexture()
const palmTexture = makePalmTexture()
const floorTexture = makeFloorTexture()

/* ─── Tint presets for frame / lens inspection (golden hour) ─ */
const NEUTRAL_TINT = {
  key: { color: new THREE.Color(0xffdfa6), intensity: 2.5 },
  fill: { color: new THREE.Color(0xffc98f), intensity: 0.6 },
  rim: { color: new THREE.Color(0xffe7c4), intensity: 1.15 },
  ambient: { color: new THREE.Color(0xffe2b4), intensity: 0.28 },
}
const FRAME_TINT = {
  key: { color: new THREE.Color(0xffcf92), intensity: 2.9 },
  fill: { color: new THREE.Color(0xffbf8a), intensity: 0.55 },
  rim: { color: new THREE.Color(0xffa44e), intensity: 2.0 },
  ambient: { color: new THREE.Color(0xffdba4), intensity: 0.35 },
}
const LENS_TINT = {
  key: { color: new THREE.Color(0xffe8c6), intensity: 2.4 },
  fill: { color: new THREE.Color(0xcfe0ff), intensity: 0.75 },
  rim: { color: new THREE.Color(0xfff2da), intensity: 1.5 },
  ambient: { color: new THREE.Color(0xffe6c0), intensity: 0.3 },
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
  const plinthRef = useRef()
  const plinthMatRef = useRef()
  const floorRef = useRef()
  const floorMatRef = useRef()
  const plinthTargetY = useRef(-0.5)
  const goboTarget = useMemo(() => new THREE.Object3D(), [])
  const spinFreeze = useRef(null)

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

  /* ---- Premium material rework for the sunglasses ---- */
  useEffect(() => {
    if (!sunModelRoot) return
    sunModelRoot.traverse((child) => {
      if (!child.isMesh || !child.material) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => {
        if (!m || m.userData.onyxStyled) return
        if (m.name === 'default1') {
          // Frame → polished gold, catching the golden-hour light
          m.color.set('#c9a24a')
          m.metalness = 1.0
          m.roughness = 0.22
          m.envMapIntensity = 1.3
        } else {
          // Lenses → dark mirror glass
          m.color.set('#141519')
          m.metalness = 0.85
          m.roughness = 0.06
          m.envMapIntensity = 1.5
        }
        m.userData.onyxStyled = true
        m.needsUpdate = true
      })
    })
  }, [sunModelRoot])

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
    if (activePart && activePart !== 'sunglasses' && t2 < 0.28) {
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

  /* ---- Tag part meshes + enable shadows ---- */
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
        child.castShadow = true
      }
    })
    if (sunModelRoot) {
      sunModelRoot.visible = false
      sunModelRoot.traverse((child) => { if (child.isMesh) child.castShadow = true })
    }
    onModelReady?.()
  }, [modelRoot, sunModelRoot, onModelReady])

  /* ---- Freeze the turntable spin while inspecting a part ---- */
  useEffect(() => {
    if (activePart && activePart !== 'sunglasses') {
      spinFreeze.current = modelRoot.rotation.y
    } else if (!activePart) {
      spinFreeze.current = null
    }
  }, [activePart, modelRoot])

  /* ---- Keep the travertine plinth under the visible model ---- */
  useEffect(() => {
    const target = modelSwappedToSun ? sunModelRoot : modelRoot
    if (!target) return
    const box = new THREE.Box3().setFromObject(target)
    plinthTargetY.current = box.min.y - 0.08 // half of plinth height, top flush with model base
  }, [modelSwappedToSun, modelRoot, sunModelRoot])

  useEffect(() => {
    if (Object.keys(partObjects).length) onHotspotsReady?.(null, partObjects)
  }, [partObjects, onHotspotsReady])

  /* ---- Per-frame update ---- */
  useFrame((state) => {
    /* Plinth: glide toward target height; only fades in during the sunglasses chapter */
    if (plinthRef.current) {
      plinthRef.current.position.y = THREE.MathUtils.lerp(plinthRef.current.position.y, plinthTargetY.current, 0.06)
      goboTarget.position.set(0, plinthRef.current.position.y, 0)
      if (plinthMatRef.current) {
        plinthMatRef.current.opacity = THREE.MathUtils.smoothstep(t2, 0.28, 0.42)
      }
    }

    /* Reflective floor: grounds the glasses during its rotation, then hands
       the stage over to the plinth when the sunglasses chapter begins */
    if (floorRef.current && floorMatRef.current) {
      floorRef.current.position.y = plinthRef.current.position.y + 0.065
      floorMatRef.current.opacity =
        THREE.MathUtils.smoothstep(t1, 0.15, 0.4) *
        (1 - THREE.MathUtils.smoothstep(t2, 0.25, 0.42))
    }

    if (!controlsRef.current) return

    /* Chapter 1 drift — rotation stretches across 85% of the chapter,
       leaving a long hold at the end before any content appears */
    const e1 = THREE.MathUtils.smoothstep(t1, 0, 0.85)

    /* Turntable spin: each model does one full Y-axis revolution over its
       chapter, synced with the camera drift (frozen while inspecting) */
    const targetYaw = e1 * Math.PI * 2
    modelRoot.rotation.y = spinFreeze.current ?? targetYaw
    if (sunModelRoot) {
      const t2spin = Math.max(0, Math.min(1, (t2 - 0.32) / 0.58))
      const e2spin = t2spin * t2spin * (3 - 2 * t2spin)
      sunModelRoot.rotation.y = e2spin * Math.PI * 2
    }

    /* Floating — fades in as each rotation completes, gentle perpetual bob */
    const time = state.clock.elapsedTime
    const glassesFloat = THREE.MathUtils.smoothstep(t1, 0.78, 0.92)
    modelRoot.position.y = glassesFloat * Math.sin(time * 1.1) * 0.05
    if (sunModelRoot) {
      const sunFloat = THREE.MathUtils.smoothstep(t2, 0.86, 0.96)
      sunModelRoot.position.y = sunFloat * Math.sin(time * 1.1 + 1.7) * 0.05
    }

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

    /* Model swap early in the chapter, hidden under the transition fade (t2 >= 0.30) */
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

    /* Chapter 2: sunglasses camera drift — long slow orbit across 32%–90% of the
       chapter, mirroring the glasses rotation */
    if (sunModelRoot && framing.sun && t2 >= 0.32) {
      const t2drift = Math.max(0, Math.min(1, (t2 - 0.32) / 0.58))
      const e2 = t2drift * t2drift * (3 - 2 * t2drift)
      camera.position.lerpVectors(framing.sun.farCamPos, framing.sun.defaultCamPos, e2)
      controlsRef.current.target.lerpVectors(framing.sun.defaultTarget, framing.sun.defaultTarget, e2)
    }

    /* Controls enabled once each rotation completes (no lerp fighting) */
    const glassesSettled = t1 >= 0.85 && t2 <= 0.001
    const sunSettled = t2 >= 0.90
    controlsRef.current.enabled = glassesSettled || sunSettled

    controlsRef.current.update()
  })

  return (
    <>
      {/* Golden-hour lights — low key light, warm bounces */}
      <directionalLight
        ref={keyRef} position={[3, 1.3, 2.6]} intensity={2.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-camera-near={0.1}
        shadow-camera-far={14}
        shadow-bias={-0.0004}
      />
      <directionalLight ref={fillRef} position={[-3, 0.9, 1.6]} intensity={0.6} color={0xffc98f} />
      <directionalLight ref={rimRef} position={[0, 1.8, -3]} intensity={1.15} color={0xffe7c4} />
      <ambientLight ref={ambRef} intensity={0.28} color={0xffe2b4} />

      {/* Palm-leaf dappled sun — projects a gobo cookie across the plinth */}
      <primitive object={goboTarget} />
      <spotLight
        position={[3.6, 2.1, 2.9]}
        angle={0.55}
        penumbra={0.75}
        intensity={3}
        color={0xffd9a0}
        map={palmTexture}
        target={goboTarget}
      />

      {/* Commercial studio environment — warm key, fill and rim lightformers give the
          models realistic golden-hour reflections (rendered once, off-screen) */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={5} color="#ffdfa6" position={[3, 2.2, 3]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ffc98f" position={[-3.5, 1, 2]} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffe7c4" position={[0, 1.6, -4]} scale={[7, 2.5, 1]} />
        <Lightformer form="circle" intensity={3.5} color="#ffd9a0" position={[4.5, 2.8, -1]} scale={[2, 2, 1]} />
        <Lightformer form="rect" intensity={1} color="#9a7a55" position={[0, -2.5, 0]} scale={[10, 10, 1]} />
      </Environment>

      {/* Travertine display plinth — only the sunglasses chapter sits on this stage */}
      <group ref={plinthRef} position={[0, -0.5, 0]}>
        <RoundedBox args={[1.7, 0.16, 1.7]} radius={0.03} smoothness={4} receiveShadow>
          <meshStandardMaterial ref={plinthMatRef} map={plinthTexture} roughness={0.85} metalness={0} transparent />
        </RoundedBox>
      </group>

      {/* Warm glossy floor — premium reflective surface under the glasses */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.2, 4.2]} />
        <meshStandardMaterial
          ref={floorMatRef}
          map={floorTexture}
          alphaMap={floorTexture}
          transparent
          color="#2a1d15"
          metalness={0.75}
          roughness={0.32}
          envMapIntensity={0.9}
          depthWrite={false}
        />
      </mesh>

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
        shadows
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
