import { useState, useCallback, useRef, Suspense } from 'react'
import Scene from './components/Scene'
import { HeroStarfield, ScrollHint, OutroLine, ShopInfo, ChapterFade, TransitionWords } from './components/Overlays'
import Hotspots from './components/Hotspots'
import Drawer from './components/Drawer'
import ProductCollection from './components/ProductCollection'
import LifestyleStrip from './components/LifestyleStrip'
import { Logo, WhatsAppButton } from './components/Header'
import Loading from './components/Loading'
import { useScrollProgress, INTRO_VH } from './hooks/useScrollProgress'
import { useProducts } from './hooks/useProducts'
import { useGlassesModel } from './hooks/useModelProgress'
import SplitHero from './components/SplitHero'
import ScrollBackgrounds from './components/ScrollBackgrounds'

export default function App() {
  const spacerRef = useRef()
  const { progress, t1, t2 } = useScrollProgress(spacerRef)
  const { products, removeProduct, addProduct, updateProduct } = useProducts()
  const { scene: glassesScene, progress: modelProgress } = useGlassesModel()

  const [modelReady, setModelReady] = useState(false)
  const [activePart, setActivePart] = useState(null)
  const [requestResetView, setRequestResetView] = useState(0)
  const partObjectsRef = useRef(null)

  const handleModelReady = useCallback(() => setModelReady(true), [])
  const handlePartClick = useCallback((partId) => setActivePart(partId), [])

  const handleCloseDrawer = useCallback(() => {
    // Don't reset the camera during the sunglasses chapter — the glasses model is hidden then
    if (activePart && activePart !== 'sunglasses' && t2 < 0.28) {
      setRequestResetView(n => n + 1)
    }
    setActivePart(null)
  }, [activePart, t2])

  const handleHotspotsReady = useCallback((partId, objs) => {
    if (objs) partObjectsRef.current = objs
    if (partId) setActivePart(partId)
  }, [])

  const isInspectingGlasses = activePart && activePart !== 'sunglasses'
  // Product strip appears late — only after the full rotation finishes (t1 >= 0.92)
  const glassesSettled = t1 >= 0.92 && t2 === 0 && !activePart

  return (
    <>
      <Loading ready={modelReady} progress={modelProgress} />

      {/* Split-in-half intro hero — plays before the 3D journey starts */}
      <SplitHero />

      {/* Chapter backdrops behind the transparent 3D canvas */}
      <ScrollBackgrounds t1={t1} t2={t2} />

      <div ref={spacerRef} className="w-full" style={{ height: `calc(1200vh + ${INTRO_VH}vh)` }} aria-hidden="true" />

      <Logo />
      <WhatsAppButton />

      <Suspense fallback={null}>
        <Scene
          t1={t1} t2={t2}
          activePart={activePart}
          onModelReady={handleModelReady}
          onPartClick={handlePartClick}
          requestResetView={requestResetView}
          glassesScene={glassesScene}
        />
      </Suspense>

      <HeroStarfield t1={t1} />
      <ChapterFade t2={t2} />
      <TransitionWords t2={t2} />

      <ScrollHint t1={t1} t2={t2} />
      <OutroLine t1={t1} t2={t2} />
      <ShopInfo t1={t1} t2={t2} />

      {/* Lifestyle photos — stagger in during glasses chapter */}
      <LifestyleStrip t1={t1} t2={t2} />

      <Hotspots
        t1={t1} t2={t2}
        activePart={activePart}
        onPartClick={handlePartClick}
        partObjectsRef={partObjectsRef}
      />

      {/* Back button */}
      <button
        className={`fixed top-6 right-6 z-20 bg-transparent border border-onyx-line text-onyx-muted px-4 py-2 text-[11.5px] rounded-full cursor-pointer transition-all duration-200 ${
          isInspectingGlasses ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transition: 'opacity 0.2s ease, border-color 0.15s ease, color 0.15s ease' }}
        onClick={handleCloseDrawer}
        onMouseEnter={(e) => { e.target.style.borderColor = '#c9a24a'; e.target.style.color = '#f2f1ee' }}
        onMouseLeave={(e) => { e.target.style.borderColor = ''; e.target.style.color = '' }}
      >
        ← Back to full view
      </button>

      {/* Bottom collection strip */}
      {glassesSettled && (
        <ProductCollection
          activePart="frame"
          products={products}
          onProductClick={handlePartClick}
        />
      )}
      {/* End of scroll — frames, lenses & sunglasses pop up very late (t2 >= 0.95) */}
      {t2 >= 0.95 && !activePart && (
        <ProductCollection
          variant="center"
          t2={t2}
          products={products}
          onProductClick={handlePartClick}
        />
      )}

      <Drawer
        activePart={activePart}
        onClose={handleCloseDrawer}
        products={products}
        onRemove={removeProduct}
        onAdd={addProduct}
        onUpdate={updateProduct}
      />
    </>
  )
}
