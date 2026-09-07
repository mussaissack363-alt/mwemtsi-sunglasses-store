import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// Cache raw downloads so StrictMode remounts and retries don't re-fetch 9 MB
THREE.Cache.enabled = true

const MODEL_URL = import.meta.env.BASE_URL + 'glasses(1).glb'

let scenePromise = null
const listeners = new Set()
let lastProgress = { fraction: null, bytes: 0 }

function report(p) {
  lastProgress = p
  listeners.forEach((fn) => fn(p))
}

function loadOnce() {
  if (!scenePromise) {
    scenePromise = new Promise((resolve, reject) => {
      new GLTFLoader().load(
        MODEL_URL,
        (gltf) => resolve(gltf.scene),
        (e) => report(
          e.total > 0
            ? { fraction: Math.min(0.999, e.loaded / e.total), bytes: e.loaded }
            : { fraction: null, bytes: e.loaded }
        ),
        reject,
      )
    }).catch((err) => {
      scenePromise = null // allow a fresh attempt after a failure
      throw err
    })
  }
  return scenePromise
}

/* Downloads the glasses GLB with real download progress. The parsed scene is
   passed down to <Scene> as a prop, replacing useGLTF there (useGLTF gives no
   progress feedback — on mobile the 9 MB download just looked stuck). */
export function useGlassesModel() {
  const [scene, setScene] = useState(null)
  const [progress, setProgress] = useState(lastProgress)

  useEffect(() => {
    let alive = true
    let retries = 0
    const onProgress = (p) => { if (alive) setProgress(p) }
    listeners.add(onProgress)
    const attempt = () => {
      loadOnce()
        .then((s) => { if (alive) setScene(s) })
        .catch(() => {
          if (!alive || retries >= 2) return
          retries += 1
          setTimeout(attempt, 2500)
        })
    }
    attempt()
    return () => { alive = false; listeners.delete(onProgress) }
  }, [])

  return { scene, progress }
}
