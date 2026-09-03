/* Cinematic dusk backdrop for the 3D product stage:
   deep plum-to-amber sky, glowing low sun with god rays, atmospheric haze,
   soft lens bokeh, rim-lit desert dunes, an elegant lit villa, film grain
   and a warm vignette — a premium commercial look. Pure SVG, rendered once. */

export default function CommercialBackdrop({ hot = false }) {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lux-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b1226" />
          <stop offset="30%" stopColor="#3a2440" />
          <stop offset="55%" stopColor="#7a3f52" />
          <stop offset="72%" stopColor="#c96b4a" />
          <stop offset="85%" stopColor="#f0985a" />
          <stop offset="93%" stopColor="#ffc48c" />
          <stop offset="100%" stopColor="#ffd9a8" />
        </linearGradient>
        <radialGradient id="lux-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffe9c2" stopOpacity="0.98" />
          <stop offset="30%" stopColor="#ffb26b" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#ff9c4d" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ff9c4d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lux-haze" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#ffcfa0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffcfa0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lux-duneFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4a44" />
          <stop offset="100%" stopColor="#4a2f33" />
        </linearGradient>
        <linearGradient id="lux-duneMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c3a36" />
          <stop offset="100%" stopColor="#36222b" />
        </linearGradient>
        <linearGradient id="lux-duneNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f2a2c" />
          <stop offset="100%" stopColor="#1e141d" />
        </linearGradient>
        <linearGradient id="lux-villa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#301d29" />
          <stop offset="100%" stopColor="#241420" />
        </linearGradient>
        <filter id="lux-blurL" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="lux-blurM" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="lux-blurS" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <radialGradient id="lux-vignette" cx="0.5" cy="0.42" r="0.78">
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="88%" stopColor="#1a0d1c" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0d0510" stopOpacity="0.62" />
        </radialGradient>
        <filter id="lux-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="1600" height="900" fill="url(#lux-sky)" />

      {/* Low golden-hour sun with a wide soft glow */}
      <circle cx="1200" cy="600" r="460" fill="url(#lux-glow)" />
      <circle cx="1200" cy="600" r="60" fill="#ffe4b4" filter="url(#lux-blurS)" />
      <circle cx="1200" cy="600" r="34" fill={hot ? '#ffcf8f' : '#fff4d8'} />

      {/* God rays streaming from the sun */}
      <g fill="#ffc98f" opacity="0.16" filter="url(#lux-blurL)">
        <polygon points="1200,600 880,420 980,300 1200,600" />
        <polygon points="1200,600 1050,360 1140,280 1200,600" />
        <polygon points="1200,600 1380,340 1480,420 1200,600" />
        <polygon points="1200,600 1520,500 1580,560 1200,600" />
      </g>

      {/* Atmospheric haze hugging the horizon */}
      <ellipse cx="1150" cy="640" rx="900" ry="180" fill="url(#lux-haze)" />

      {/* Soft lens bokeh near the sun */}
      <g filter="url(#lux-blurM)">
        <circle cx="1030" cy="430" r="70" fill="#ffd9a0" opacity="0.25" />
        <circle cx="1360" cy="380" r="48" fill="#ffd9a0" opacity="0.18" />
        <circle cx="900" cy="520" r="32" fill="#ffe3b0" opacity="0.2" />
        <circle cx="1500" cy="470" r="26" fill="#ffe3b0" opacity="0.15" />
      </g>

      {/* Far dunes — defocused, with a sunlit crest */}
      <path
        d="M0 655 C 200 615, 420 668, 660 640 C 900 612, 1130 650, 1340 630 C 1450 622, 1530 630, 1600 625 L1600 900 L0 900 Z"
        fill="url(#lux-duneFar)"
        filter="url(#lux-blurL)"
        opacity="0.96"
      />
      <path
        d="M0 655 C 200 615, 420 668, 660 640 C 900 612, 1130 650, 1340 630 C 1450 622, 1530 630, 1600 625"
        fill="none" stroke="#ffcf94" strokeWidth="2.5" opacity="0.4" filter="url(#lux-blurS)"
      />

      {/* Minimalist villa on a ridge — warm lit windows, a glowing pool */}
      <g filter="url(#lux-blurM)" opacity="0.95">
        <path d="M430 660 C 540 616, 660 622, 780 660 L780 676 L430 676 Z" fill="#2b1b26" />
        <rect x="470" y="548" width="96" height="112" fill="url(#lux-villa)" />
        <rect x="598" y="562" width="74" height="98" fill="url(#lux-villa)" />
        <rect x="706" y="578" width="54" height="82" fill="url(#lux-villa)" />
        <rect x="484" y="570" width="16" height="26" fill="#ffd9a0" opacity="0.9" />
        <rect x="530" y="570" width="16" height="26" fill="#ffd9a0" opacity="0.65" />
        <rect x="610" y="584" width="13" height="20" fill="#ffd9a0" opacity="0.8" />
        <rect x="640" y="584" width="13" height="20" fill="#ffd9a0" opacity="0.5" />
        <rect x="716" y="596" width="12" height="18" fill="#ffd9a0" opacity="0.7" />
        <rect x="500" y="650" width="120" height="10" rx="5" fill="#ffc98f" opacity="0.35" />
      </g>

      {/* Mid dunes — rim-lit */}
      <path
        d="M0 730 C 320 668, 640 712, 920 684 C 1180 658, 1400 700, 1600 672 L1600 900 L0 900 Z"
        fill="url(#lux-duneMid)"
        filter="url(#lux-blurM)"
        opacity="0.96"
      />
      <path
        d="M0 730 C 320 668, 640 712, 920 684 C 1180 658, 1400 700, 1600 672"
        fill="none" stroke="#e8a76b" strokeWidth="2" opacity="0.3" filter="url(#lux-blurS)"
      />

      {/* Near dune band */}
      <path
        d="M0 818 C 380 776, 760 806, 1120 788 C 1340 776, 1480 798, 1600 786 L1600 900 L0 900 Z"
        fill="url(#lux-duneNear)"
      />
      <path
        d="M0 818 C 380 776, 760 806, 1120 788 C 1340 776, 1480 798, 1600 786"
        fill="none" stroke="#c07a4e" strokeWidth="1.6" opacity="0.25" filter="url(#lux-blurS)"
      />

      {/* Film grain + warm vignette */}
      <rect width="1600" height="900" filter="url(#lux-grain)" />
      <rect width="1600" height="900" fill="url(#lux-vignette)" />
    </svg>
  )
}