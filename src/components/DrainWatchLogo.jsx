import React from 'react';

/**
 * DrainWatch Monogram Emblem (D with Water Droplet + Stream Flow + Ripples & W with Watch/Gauge Dial)
 * Matches the uploaded DrainWatch graphic design.
 */
export default function DrainWatchLogo({ 
  size = 40, 
  color = '#0A192F', 
  accentColor = '#0284C7',
  showText = false, 
  className = '' 
}) {
  return (
    <div className={`drainwatch-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drainwatch-logo-mark"
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`dwNewGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color === '#FFFFFF' ? '#E2E8F0' : '#071E3D'} />
          </linearGradient>
        </defs>

        <g id="drainwatch-emblem">
          {/* --- Letter 'D' Body --- */}
          <path
            d="M 60 120 
               H 170 
               C 245 120, 290 160, 290 230 
               C 290 300, 245 340, 170 340 
               H 60 
               Z"
            fill={`url(#dwNewGrad-${size})`}
          />

          {/* Inner Negative Space cutout of D */}
          <path
            d="M 115 165 
               H 165 
               C 205 165, 230 190, 230 230 
               C 230 270, 205 295, 165 295 
               H 115 
               Z"
            fill={color === '#FFFFFF' ? '#0A192F' : '#FFFFFF'}
          />

          {/* Water Droplet Inside D */}
          <path
            d="M 160 165 
               C 160 165, 125 210, 125 235 
               C 125 255, 140 270, 160 270 
               C 180 270, 195 255, 195 235 
               C 195 210, 160 165, 160 165 Z"
            fill={`url(#dwNewGrad-${size})`}
          />

          {/* Drainage Stream Flowing Downward from Droplet */}
          <path
            d="M 152 270 
               C 152 285, 195 288, 205 320 
               C 212 342, 235 375, 275 385 
               L 260 400 
               C 220 390, 195 355, 185 330 
               C 175 305, 135 295, 135 270 
               Z"
            fill={`url(#dwNewGrad-${size})`}
          />

          {/* Flow Channel Stream Highlights */}
          <path
            d="M 168 275 
               C 168 290, 208 298, 218 328 
               C 225 350, 248 378, 288 392"
            stroke={color === '#FFFFFF' ? '#0A192F' : '#FFFFFF'}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 180 280 
               C 180 295, 218 305, 228 335 
               C 235 355, 258 382, 298 398"
            stroke={`url(#dwNewGrad-${size})`}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Concentric Water Wave Ripples at Bottom */}
          <ellipse cx="270" cy="405" rx="140" ry="24" stroke={`url(#dwNewGrad-${size})`} strokeWidth="10" fill="none" />
          <ellipse cx="270" cy="405" rx="105" ry="17" stroke={`url(#dwNewGrad-${size})`} strokeWidth="8" fill="none" />
          <ellipse cx="270" cy="405" rx="70" ry="11" stroke={`url(#dwNewGrad-${size})`} strokeWidth="6" fill="none" />
          <ellipse cx="270" cy="405" rx="35" ry="5" stroke={`url(#dwNewGrad-${size})`} strokeWidth="4" fill="none" />

          {/* --- Letter 'W' Body --- */}
          <path
            d="M 235 340 
               L 295 190 
               L 345 310 
               L 405 190 
               L 445 340 
               H 395 
               L 375 255 
               L 340 340 
               H 315 
               L 280 255 
               L 260 340 
               Z"
            fill={`url(#dwNewGrad-${size})`}
          />

          {/* --- Gauge / Speedometer / Watch Bezel Arc at Top-Right of W --- */}
          <path
            d="M 330 170 
               A 80 80 0 1 1 475 230"
            stroke={`url(#dwNewGrad-${size})`}
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />

          {/* Gauge / Watch Needle Pointer */}
          <path
            d="M 405 175 
               L 445 135"
            stroke={`url(#dwNewGrad-${size})`}
            strokeWidth="14"
            strokeLinecap="round"
          />
          
          {/* Gauge Center Dial Hub */}
          <circle cx="395" cy="185" r="9" fill={`url(#dwNewGrad-${size})`} />
        </g>
      </svg>

      {showText && (
        <div className="brand-text-group" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div className="brand-name" style={{ fontSize: '1.35rem', fontWeight: 800, color: color === '#FFFFFF' ? '#FFFFFF' : '#0A192F', letterSpacing: '-0.02em' }}>
            Drain<span style={{ color: accentColor }}>Watch</span>
          </div>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: color === '#FFFFFF' ? '#94A3B8' : '#64748B' }}>
            Smart Urban Drainage
          </span>
        </div>
      )}
    </div>
  );
}
