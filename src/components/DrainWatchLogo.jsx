import React from 'react';

/**
 * DrainWatch Brand Logo (DW Monogram with Flow Arrow)
 * Matches the official DrainWatch emblem vector.
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
        height={size * (150 / 220)}
        viewBox="0 0 220 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drainwatch-logo-mark"
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="dwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#0F294D" />
          </linearGradient>
        </defs>

        {/* --- D Monogram Outer & Inner Loop --- */}
        {/* D Outer Rounded Frame */}
        <path
          d="M 22 18 
             H 82 
             C 122 18, 142 46, 142 75 
             C 142 104, 122 132, 82 132 
             H 22 
             C 14 132, 10 128, 10 120 
             V 30 
             C 10 22, 14 18, 22 18 Z"
          fill="none"
          stroke="url(#dwGrad)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* D Inner Contour Line (giving the double-outline architectural look) */}
        <path
          d="M 32 38 
             H 76 
             C 104 38, 118 54, 118 75 
             C 118 96, 104 112, 76 112 
             H 32 
             V 38 Z"
          fill="none"
          stroke="url(#dwGrad)"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* --- W Stroke with Dynamic Wave & Arrow --- */}
        {/* 1st Stroke: Inner Downward Diagonal */}
        <path
          d="M 68 50 
             L 100 124"
          fill="none"
          stroke="url(#dwGrad)"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* 2nd Stroke: Wave Upward Flow Crest */}
        <path
          d="M 98 124 
             C 108 100, 120 62, 134 62 
             C 146 62, 150 82, 158 122"
          fill="none"
          stroke="url(#dwGrad)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3rd Stroke: Diagonal Ascent to Arrow */}
        <path
          d="M 158 122 
             L 194 38"
          fill="none"
          stroke="url(#dwGrad)"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Arrowhead at the top right of W */}
        <path
          d="M 172 35 
             L 216 14 
             L 204 58 
             L 190 44 
             Z"
          fill="url(#dwGrad)"
          stroke="url(#dwGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="brand-text-group" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div className="brand-name" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A192F', letterSpacing: '-0.02em' }}>
            Drain<span style={{ color: accentColor }}>Watch</span>
          </div>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>
            Smart Urban Drainage
          </span>
        </div>
      )}
    </div>
  );
}
