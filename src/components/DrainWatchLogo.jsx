import React from 'react';

/**
 * DrainWatch Official Smart Social Infrastructure Emblem
 * Integrates urban drainage telemetry, IoT wireless sensing nodes, flow conduits, and manhole basin grid.
 */
export default function DrainWatchLogo({ 
  size = 40, 
  color = '#0A192F', 
  accentColor = '#0284C7',
  showText = false, 
  className = '' 
}) {
  return (
    <div 
      className={`drainwatch-logo-container ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}
    >
      <img
        src="/logo.png"
        alt="DrainWatch Emblem"
        width={size}
        height={size}
        className="drainwatch-logo-mark"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 5px rgba(10, 25, 47, 0.12))'
        }}
      />

      {showText && (
        <div className="brand-text-group" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div 
            className="brand-name" 
            style={{ 
              fontSize: '1.35rem', 
              fontWeight: 800, 
              color: color === '#FFFFFF' ? '#FFFFFF' : '#0A192F', 
              letterSpacing: '-0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0
            }}
          >
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

