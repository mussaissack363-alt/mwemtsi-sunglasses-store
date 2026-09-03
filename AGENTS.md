# Project knowledge

ONYX — single-page 3D eyewear e-commerce site.

## Quickstart
- Setup: None — no dependencies to install
- Dev: `python3 -m http.server 8080` then open `http://localhost:8080`
- Test: Open in browser, scroll to test camera drift, click hotspots, test admin mode (PIN: 2580)

## Architecture
- Single `index.html` file (~646 lines) with inline CSS + JS
- Three.js v0.160.0 via CDN import map (`three` and `three/addons/`)
- Model: `glasses(1).glb` loaded with GLTFLoader
- Model nodes: `Frame_1`, `Handles_2` → frame; `Glasses_3` → lenses
- Products stored in localStorage (`onyx_products_v2`)
- Reference backup: `site-v2.html`

## Conventions
- Dark theme: `#000` bg, `#c9a24a` gold accent, `#f2f1ee` text
- No build tools, no framework — pure vanilla JS
- CSS custom properties in `:root`
- Hotspots positioned via 3D→screen projection each frame
- Camera animations use cubic ease-out lerp

## Things to avoid
- Don't rename `glasses(1).glb` — the loader references this exact path
- Don't rename model nodes in the GLB — hotspot mapping depends on `Frame_1`, `Handles_2`, `Glasses_3`
- Don't remove the 230vh scroll spacer — scroll-driven camera depends on it
- Don't enable OrbitControls before hero scroll completes
