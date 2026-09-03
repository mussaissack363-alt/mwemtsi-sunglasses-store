import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 120
const DRIFT_SPEED = 0.06
const SPREAD = 14

/**
 * 3D animated background layer:
 *  – drifting instanced particles (stars)
 *  – slow-rotating wireframe torus knot for ambient depth
 *  – colors shift with scroll progress
 */

function generateParticleData(count) {
  const positions = []
  const scales = []
  const speeds = []
  const offsets = []

  for (let i = 0; i < count; i++) {
    // Spread particles in a large sphere behind the model
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 3 + Math.random() * SPREAD

    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi) - 6, // pushed back behind model
    )

    // 90% small, 10% bright/large
    const isBright = Math.random() < 0.1
    scales.push(isBright ? 0.025 + Math.random() * 0.03 : 0.008 + Math.random() * 0.012)
    speeds.push(0.2 + Math.random() * 0.8) // per-particle drift speed multiplier
    offsets.push(Math.random() * Math.PI * 2) // phase offset for oscillation
  }

  return { positions, scales, speeds, offsets }
}

// Colors for different scroll phases
const COLOR_COOL = new THREE.Color(0x3a6073) // hero teal-ish
const COLOR_WARM = new THREE.Color(0x8a6530) // frame amber
const COLOR_NEUTRAL = new THREE.Color(0x2a3040) // lifestyle blue-grey
const COLOR_BRIGHT = new THREE.Color(0xc9a24a) // accent gold (for bright particles)

export default function LiveBackground({ progress = 0 }) {
  const meshRef = useRef()
  const wireRef = useRef()
  const timeRef = useRef(0)

  const { positions, scales, speeds, offsets } = useMemo(
    () => generateParticleData(PARTICLE_COUNT),
    [],
  )

  // Pre-compute per-particle matrices and colors
  const { matrices, baseColors, dummy } = useMemo(() => {
    const dummy = new THREE.Object3D()
    const matrices = []
    const baseColors = []
    const tempColor = new THREE.Color()

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      dummy.scale.setScalar(scales[i])
      dummy.updateMatrix()
      matrices.push(dummy.matrix.clone())

      // Determine if bright particle
      const isBright = scales[i] > 0.03
      if (isBright) {
        tempColor.copy(COLOR_BRIGHT)
      } else {
        tempColor.copy(COLOR_COOL)
      }
      baseColors.push(tempColor.clone())
    }

    return { matrices, baseColors, dummy }
  }, [positions, scales])

  useFrame((state, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const mesh = meshRef.current
    const wire = wireRef.current

    if (mesh) {
      const tempObj = new THREE.Object3D()
      const tempColor = new THREE.Color()
      const lerpT = Math.max(0, Math.min(1, progress))

      // Interpolate base color based on scroll phase
      let targetColor
      if (lerpT < 0.28) {
        targetColor = COLOR_COOL
      } else if (lerpT < 0.52) {
        const p = (lerpT - 0.28) / 0.24
        targetColor = COLOR_COOL.clone().lerp(COLOR_WARM, p)
      } else if (lerpT < 0.76) {
        const p = (lerpT - 0.52) / 0.24
        targetColor = COLOR_WARM.clone().lerp(COLOR_NEUTRAL, p)
      } else {
        const p = (lerpT - 0.76) / 0.24
        targetColor = COLOR_NEUTRAL.clone().lerp(COLOR_COOL, p)
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3
        const speed = speeds[i]
        const offset = offsets[i]
        const baseScale = scales[i]

        // Drift: slow orbital motion
        const driftX = positions[i3] + Math.sin(t * DRIFT_SPEED * speed + offset) * 0.4
        const driftY = positions[i3 + 1] + Math.cos(t * DRIFT_SPEED * speed * 0.7 + offset) * 0.3
        const driftZ = positions[i3 + 2] + Math.sin(t * DRIFT_SPEED * speed * 0.5 + offset * 2) * 0.2

        // Subtle breathing scale
        const breathe = 1 + Math.sin(t * 0.8 + offset) * 0.15

        tempObj.position.set(driftX, driftY, driftZ)
        tempObj.scale.setScalar(baseScale * breathe)
        tempObj.updateMatrix()
        mesh.setMatrixAt(i, tempObj.matrix)

        // Color: blend particle base color with the phase target
        const isBright = baseScale > 0.03
        tempColor.copy(baseColors[i]).lerp(targetColor, isBright ? 0.3 : 0.6)
        mesh.setColorAt(i, tempColor)
      }

      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }

    // Slow-rotating wireframe torus knot
    if (wire) {
      wire.rotation.x = t * 0.03
      wire.rotation.y = t * 0.02
      wire.rotation.z = Math.sin(t * 0.1) * 0.1
    }
  })

  return (
    <group>
      {/* Particle stars */}
      <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} vertexColors />
      </instancedMesh>

      {/* Ambient wireframe geometry */}
      <mesh ref={wireRef} position={[0, 0, -10]}>
        <torusKnotGeometry args={[2.5, 0.4, 80, 8, 2, 3]} />
        <meshBasicMaterial
          color={0x1a2535}
          wireframe
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </mesh>

      {/* Secondary wireframe ring */}
      <mesh position={[0, 0, -12]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.5, 0.15, 8, 32]} />
        <meshBasicMaterial
          color={0x2a3a4a}
          wireframe
          transparent
          opacity={0.06}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
