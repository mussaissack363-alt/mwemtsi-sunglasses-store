# ONYX — Eyewear E-Commerce Site

## What This Is
A single-page dark-themed 3D eyewear e-commerce site. The page is entirely in `index.html` — no build tools, no bundler, no framework. Pure HTML + CSS + vanilla JS with Three.js loaded via CDN import map.

## Key Files
| File | Purpose |
|---|---|
| `index.html` | The entire site — HTML, CSS, and JS inline |
| `glasses(1).glb` | Three.js GLTF model (glasses) loaded at runtime |
| `site-v2.html` | Reference/backup copy of the site |

## How To Run
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```
No install step. No build step. Just serve the directory.

## Architecture
- **Single HTML file** (~646 lines) — all CSS and JS embedded inline
- **Three.js** (v0.160.0) via ES module import map from CDN
- **Scroll-linked camera**: `#scroll-spacer` (230vh) drives a smoothstep interpolation from a far hero angle to a tight framed shot
- **Hotspots**: "Frame" and "Lenses" pill labels positioned via 3D→screen-space projection each frame, using `unionBox()` on named model nodes
- **Model nodes**: `Frame_1`, `Handles_2` → frame part; `Glasses_3` → lenses part
- **Raycaster**: Clicking the model directly detects which part was hit via `userData.partId` ancestry walk
- **Camera animation**: `animateCamera()` does time-based lerp with cubic ease-out, disabling OrbitControls during transition
- **Drawer**: Bottom panel slides up on hotspot/model click, showing horizontally scrollable product cards with color swatches
- **Admin mode**: Pencil icon (bottom-left) → PIN prompt (`2580`) → reveals add/remove controls. Products stored in `localStorage` under key `onyx_products_v2`
- **WhatsApp**: Floating green button (bottom-right) links to `wa.me` with pre-filled message

## Conventions
- All CSS uses CSS custom properties defined in `:root`
- Dark theme: `--bg:#000000`, `--accent:#c9a24a` (warm gold), `--text:#f2f1ee`
- No rounded card grids, no drop shadows — minimal and flat
- Product cards use color swatches (not images) by default
- Admin PIN is `2580` (client-side only, not real security)

## Gotchas
- The model filename is `glasses(1).glb` (with parentheses) — the GLTFLoader reference uses this exact path
- Model nodes must be named `Frame_1`, `Handles_2`, `Glasses_3` in the GLB for hotspot mapping to work
- Scroll-driven drift only works if the page is taller than the viewport (the 230vh spacer)
- OrbitControls are disabled until the hero scroll completes (`heroComplete` flag)
- localStorage key is `onyx_products_v2` — clearing it resets to default products
