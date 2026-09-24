import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Droplets, 
  Activity, 
  ExternalLink, 
  CheckCircle2, 
  Truck, 
  Camera, 
  Compass, 
  FileText, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Maximize2
} from 'lucide-react';

export default function ComplaintDetailModal({ 
  complaint, 
  isOpen, 
  onClose, 
  onStatusChange, 
  actionLoading,
  userRole = 'Citizen'
}) {
  const [showFullPhoto, setShowFullPhoto] = useState(false);

  if (!isOpen || !complaint) return null;

  const getRiskMeta = (score) => {
    if (score >= 80) return { 
      bg: '#FEE2E2', 
      border: '#EF4444', 
      text: '#B91C1C', 
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      label: 'CRITICAL HAZARD',
      level: 'Level 1 - Immediate Emergency Dispatch',
      actionRecommendation: 'Deploy high-capacity dewatering pumps, hydraulic suction unit, and emergency perimeter barrier crew immediately.'
    };
    if (score >= 60) return { 
      bg: '#FEF3C7', 
      border: '#F59E0B', 
      text: '#B45309', 
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      label: 'HIGH PRIORITY',
      level: 'Level 2 - Rapid Field Intervention',
      actionRecommendation: 'Dispatch municipal field crew with desilting equipment and mobile drain vacuum unit within 8 hours.'
    };
    if (score >= 40) return { 
      bg: '#FEF9C3', 
      border: '#EAB308', 
      text: '#854D0E', 
      badgeBg: 'rgba(234, 179, 8, 0.15)',
      label: 'MODERATE RISK',
      level: 'Level 3 - Scheduled Maintenance',
      actionRecommendation: 'Assign trash grate clearing team and verify downstream catchment outflow within 24 hours.'
    };
    return { 
      bg: '#DCFCE7', 
      border: '#10B981', 
      text: '#15803D', 
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      label: 'LOW CONCERN',
      level: 'Level 4 - Routine Inspection',
      actionRecommendation: 'Log incident in telemetry registry and verify drainage culvert stability during weekly sweep.'
    };
  };

  const riskMeta = getRiskMeta(complaint.risk_score);

  // Category & Zone weights
  const categoryWeights = {
    'Culvert Collapse': 92,
    'Toxic Sludge & Overflow': 84,
    'Sump Overflow': 76,
    'Severe Blockage': 66,
    'Open Manhole Hazard': 64,
    'Siltation': 46,
    'Trash Grate Clog': 28,
  };

  const zoneMultipliers = {
    'Critical Health Zone': 1.45,
    'Hospital & Emergency Care': 1.45,
    'School Safety Zone': 1.35,
    'School & Educational Campus': 1.35,
    'High Traffic Transit': 1.28,
    'Metro & Transit Corridor': 1.28,
    'Dense Commercial': 1.15,
    'Residential': 1.00,
    'Public Park': 0.85,
  };

  // Landmark & Facility Proximity Analysis
  const fullContext = `${complaint.location || ''} ${complaint.description || ''} ${complaint.title || ''} ${complaint.zone_criticality || ''}`.toLowerCase();
  let facilityType = null;
  let facilityTitle = null;
  let facilityBoost = 0;
  let facilityDesc = null;
  let facilityBadgeColor = '#EF4444';
  let facilityBadgeBg = '#FEE2E2';

  if (/hospital|clinic|ambulance|icu|emergency|medical|dispensary|health center|phc|nursing/i.test(fullContext) || complaint.zone_criticality?.includes('Health') || complaint.zone_criticality?.includes('Hospital')) {
    facilityType = 'hospital';
    facilityTitle = '🏥 Hospital & Emergency Healthcare Zone';
    facilityBoost = 16;
    facilityDesc = 'Top Priority Emergency Protocol: Unobstructed ambulance transit, ICU emergency access, and bio-hazard drainage safety are strictly prioritized.';
    facilityBadgeColor = '#DC2626';
    facilityBadgeBg = '#FEE2E2';
  } else if (/school|college|kindergarten|campus|university|nursery|vidyalaya|student|child|play school/i.test(fullContext) || complaint.zone_criticality?.includes('School')) {
    facilityType = 'school';
    facilityTitle = '🏫 School & Educational Campus Safety Zone';
    facilityBoost = 14;
    facilityDesc = 'High Priority Child Protection: Pedestrian child safety, school bus access corridors, and open drain drowning hazards are prioritized.';
    facilityBadgeColor = '#D97706';
    facilityBadgeBg = '#FEF3C7';
  } else if (/metro|railway|station|transit|bus stand|terminal|underpass|subway|highway|arterial/i.test(fullContext) || complaint.zone_criticality?.includes('Transit')) {
    facilityType = 'transit';
    facilityTitle = '🚆 Metro & High-Traffic Transit Hub';
    facilityBoost = 9;
    facilityDesc = 'Mass Transit Protection: Rapid deployment to prevent severe public commuter gridlocks, underpass inundation, and vehicle stalling.';
    facilityBadgeColor = '#2563EB';
    facilityBadgeBg = '#EFF6FF';
  } else if (/market|bazaar|food street|commercial|mall/i.test(fullContext) || complaint.zone_criticality?.includes('Commercial')) {
    facilityType = 'commercial';
    facilityTitle = '🏢 Dense Commercial & Food Market Hub';
    facilityBoost = 5;
    facilityDesc = 'Civic Hygiene & Commerce Protection: Active runoff and sanitation safeguard for dense foot traffic and market operations.';
    facilityBadgeColor = '#059669';
    facilityBadgeBg = '#ECFDF5';
  }

  const catWeight = categoryWeights[complaint.category] || 50;
  const zoneMult = zoneMultipliers[complaint.zone_criticality] || (facilityType === 'hospital' ? 1.45 : facilityType === 'school' ? 1.35 : facilityType === 'transit' ? 1.28 : 1.0);
  const waterPct = complaint.water_level_pct || 50;

  const lat = complaint.latitude ? parseFloat(complaint.latitude).toFixed(5) : null;
  const lng = complaint.longitude ? parseFloat(complaint.longitude).toFixed(5) : null;
  const mapsUrl = (lat && lng) ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '1.25rem',
          overflowY: 'auto'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '920px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(10, 25, 47, 0.35)',
            border: '1px solid var(--border-beige)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Top Banner Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0A192F 0%, #1E293B 100%)',
            color: '#FFFFFF',
            padding: '1.5rem 1.75rem',
            position: 'relative',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <X size={18} />
            </button>

            {/* Badges strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#38BDF8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                {complaint.complaint_id}
              </span>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(255,255,255,0.15)',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                color: '#FFFFFF'
              }}>
                {complaint.category}
              </span>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: riskMeta.badgeBg,
                color: riskMeta.border,
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                border: `1px solid ${riskMeta.border}`
              }}>
                {riskMeta.label} ({complaint.risk_score}/100)
              </span>

              <span className={`badge-pill ${complaint.status?.includes('Critical') ? 'badge-critical' : complaint.status === 'Resolved' ? 'badge-normal' : 'badge-warning'}`}>
                {complaint.status}
              </span>
            </div>

            {/* Incident Title */}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              margin: '0 0 0.75rem 0',
              lineHeight: 1.25,
              paddingRight: '2rem'
            }}>
              {complaint.title}
            </h2>

            {/* Meta Details Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              fontSize: '0.82rem',
              color: '#94A3B8',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} color="#38BDF8" />
                <span>Reported by: <strong style={{ color: '#FFFFFF' }}>{complaint.reported_by}</strong></span>
              </div>
              {complaint.contact_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} color="#38BDF8" />
                  <span>{complaint.contact_phone}</span>
                </div>
              )}
              {complaint.created_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} color="#38BDF8" />
                  <span>{new Date(complaint.created_at).toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} color={complaint.sla_hours_remaining <= 4 ? '#EF4444' : '#38BDF8'} />
                <span style={{ color: complaint.sla_hours_remaining <= 4 ? '#EF4444' : '#94A3B8', fontWeight: 600 }}>
                  SLA: {complaint.sla_hours_remaining > 0 ? `${complaint.sla_hours_remaining} hrs left` : 'Resolved'}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div style={{
            padding: '1.75rem',
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '1.5rem',
            background: 'var(--bg-primary)'
          }}>
            {/* LEFT COLUMN: Photo Evidence + Description + Geospatial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Photo Evidence Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={18} color="var(--navy-900)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                      Field Photo Evidence
                    </h3>
                  </div>
                  {complaint.photo_url && (
                    <button
                      onClick={() => setShowFullPhoto(true)}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-beige)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--navy-900)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Maximize2 size={12} /> Full Screen
                    </button>
                  )}
                </div>

                {complaint.photo_url ? (
                  <div 
                    onClick={() => setShowFullPhoto(true)}
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      height: '240px',
                      background: '#0F172A',
                      cursor: 'pointer',
                      border: '1px solid var(--border-beige)',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                    }}
                  >
                    <img 
                      src={complaint.photo_url} 
                      alt="Incident Evidence" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(10, 25, 47, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <ShieldCheck size={13} color="#38BDF8" /> Geotagged Civic Evidence
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border-beige)',
                    color: 'var(--text-muted)'
                  }}>
                    <Camera size={32} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>No photographic evidence attached with this complaint.</p>
                  </div>
                )}
              </div>

              {/* Full Description Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <FileText size={18} color="var(--navy-900)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                    Complete Description & Field Notes
                  </h3>
                </div>

                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-beige)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem 1.25rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--navy-900)',
                  position: 'relative'
                }}>
                  <span style={{ fontSize: '1.5rem', color: 'var(--navy-300)', position: 'absolute', top: '4px', left: '8px', lineHeight: 1 }}>“</span>
                  <p style={{ margin: 0, paddingLeft: '1rem', paddingRight: '0.5rem', whiteSpace: 'pre-wrap' }}>
                    {complaint.description || 'No detailed description provided by reporter.'}
                  </p>
                </div>
              </div>

              {/* Location & GPS Geospatial Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} color="var(--navy-900)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                      Vulnerable Location & Geospatial Tag
                    </h3>
                  </div>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--water-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        textDecoration: 'none'
                      }}
                    >
                      Open in Maps <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                  {complaint.location}
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--navy-800)',
                    background: 'var(--bg-tertiary)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-beige)'
                  }}>
                    Zone Criticality: {complaint.zone_criticality || 'Residential'}
                  </span>

                  {lat && lng && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--navy-700)',
                      background: 'var(--navy-50)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px'
                    }}>
                      GPS: {lat}°, {lng}°
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Algorithmic Analysis & Triage Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Risk Gauge & Formula Breakdown */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldAlert size={18} color="var(--navy-900)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                    Drainage Risk & Severity Analysis
                  </h3>
                </div>

                {/* Big Score Card */}
                <div style={{
                  background: riskMeta.bg,
                  border: `1px solid ${riskMeta.border}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: riskMeta.text, letterSpacing: '0.05em' }}>
                      COMPOSITE RISK INDEX
                    </div>
                    <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-mono)', fontWeight: 900, color: riskMeta.text, lineHeight: 1.1 }}>
                      {complaint.risk_score} <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.8 }}>/ 100</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: riskMeta.text, marginTop: '0.2rem' }}>
                      {riskMeta.label}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      border: `4px solid ${riskMeta.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#FFFFFF',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: riskMeta.text
                    }}>
                      {complaint.risk_score}%
                    </div>
                  </div>
                </div>

                {/* Formula Breakdown Details */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Algorithmic Weighting Formula:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Category Factor */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.8rem' }}>1. Incident Category Severity (40%)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{complaint.category}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--navy-900)', fontSize: '0.85rem' }}>
                      {catWeight} pts
                    </span>
                  </div>

                  {/* Water Depth Factor */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.8rem' }}>2. Water Depth Inundation (25%)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Water level telemetry reading</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: waterPct > 70 ? '#EF4444' : 'var(--navy-900)', fontSize: '0.85rem' }}>
                      {waterPct}% depth
                    </span>
                  </div>

                  {/* Zone Multiplier */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.8rem' }}>3. Location & Zone Vulnerability (35%)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{complaint.zone_criticality || 'Residential'}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: zoneMult > 1.1 ? '#EA580C' : 'var(--navy-900)', fontSize: '0.85rem' }}>
                      {zoneMult.toFixed(2)}x factor
                    </span>
                  </div>

                  {/* Landmark Sensitivity Boost */}
                  {facilityBoost > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: facilityBadgeBg, border: `1px solid ${facilityBadgeColor}`, borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: facilityBadgeColor, fontSize: '0.8rem' }}>4. Landmark Proximity Priority Boost</div>
                        <div style={{ fontSize: '0.72rem', color: facilityBadgeColor }}>{facilityTitle}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: facilityBadgeColor, fontSize: '0.85rem' }}>
                        +{facilityBoost} pts boost
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Landmark Proximity & Facility Priority Card */}
              {facilityType && (
                <div style={{
                  background: facilityBadgeBg,
                  border: `1px solid ${facilityBadgeColor}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ShieldAlert size={18} color={facilityBadgeColor} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: facilityBadgeColor, margin: 0 }}>
                      Location Sensitivity: {facilityTitle}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--navy-900)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                    {facilityDesc}
                  </p>
                </div>
              )}

              {/* Hydrological Status & Water Depth */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <Droplets size={18} color="var(--water-cyan)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                    Hydrological Inundation Status
                  </h3>
                </div>

                <div style={{ marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                    <span>Culvert Water Level Depth</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: waterPct > 80 ? '#EF4444' : waterPct > 60 ? '#F59E0B' : 'var(--water-cyan)' }}>
                      {waterPct}% capacity
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${waterPct}%`,
                      height: '100%',
                      background: waterPct > 80 ? '#EF4444' : waterPct > 60 ? '#F59E0B' : 'var(--water-cyan)',
                      transition: 'width 0.4s'
                    }}></div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {waterPct >= 80 
                    ? '⚠️ Severe hydraulic backup detected. High potential for road submergence, traffic stalling, and structural culvert breach.'
                    : waterPct >= 60 
                    ? '⚠️ Elevated stormwater accumulation. Sump discharge required to prevent overflow into pedestrian pavements.'
                    : '✅ Water depth is within nominal drainage threshold.'}
                </div>
              </div>

              {/* Recommended Field Action Protocol */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <Truck size={18} color="var(--navy-900)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                    Recommended Action Protocol
                  </h3>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: riskMeta.text, marginBottom: '0.35rem' }}>
                  {riskMeta.level}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--navy-800)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                  {riskMeta.actionRecommendation}
                </p>

                {/* Dispatch / Resolution Actions (For Municipal Officers / Admin) */}
                {onStatusChange && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    {complaint.status !== 'Critical Dispatch' && complaint.status !== 'Resolved' && (
                      <button
                        onClick={() => onStatusChange(complaint.id, 'Critical Dispatch')}
                        disabled={actionLoading === complaint.id}
                        style={{
                          background: '#DC2626',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                        }}
                      >
                        <Zap size={14} /> Dispatch Critical Crew
                      </button>
                    )}

                    {complaint.status !== 'In Progress' && complaint.status !== 'Resolved' && (
                      <button
                        onClick={() => onStatusChange(complaint.id, 'In Progress')}
                        disabled={actionLoading === complaint.id}
                        style={{
                          background: 'var(--navy-900)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Activity size={14} /> Mark In Progress
                      </button>
                    )}

                    {complaint.status !== 'Resolved' ? (
                      <button
                        onClick={() => onStatusChange(complaint.id, 'Resolved')}
                        disabled={actionLoading === complaint.id}
                        style={{
                          background: '#059669',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                        }}
                      >
                        <CheckCircle2 size={14} /> Mark Resolved
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={16} /> Closed & Resolved
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Footer Bar */}
          <div style={{
            padding: '1rem 1.75rem',
            background: '#FFFFFF',
            borderTop: '1px solid var(--border-beige)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              DrainWatch Incident Intelligence & Geotagged Hazard Registry
            </div>
            <button
              onClick={onClose}
              className="btn-secondary-outline"
              style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
            >
              Close Details
            </button>
          </div>
        </div>
      </div>

      {/* Full Photo Lightbox Modal */}
      {showFullPhoto && complaint.photo_url && (
        <div
          onClick={() => setShowFullPhoto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 17, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 130,
            padding: '1.5rem',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '900px',
              maxHeight: '88vh',
              background: '#0A192F',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <button
              onClick={() => setShowFullPhoto(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#FFF',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>
            <img
              src={complaint.photo_url}
              alt="High Resolution Incident Evidence"
              style={{
                width: '100%',
                maxHeight: '78vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div style={{ padding: '0.9rem 1.5rem', background: '#0A192F', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{complaint.title}</span>
              <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{complaint.complaint_id}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
