import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Navigation, 
  Sparkles, 
  ShieldAlert, 
  Image as ImageIcon,
  Compass,
  Check,
  Info,
  ExternalLink
} from 'lucide-react';

export default function CitizenComplaintModal({ isOpen, onClose, onSuccess, user }) {
  // Step 1: Photo State
  const [photoData, setPhotoData] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Step 2: Location State
  const [locationAddress, setLocationAddress] = useState('');
  const [coords, setCoords] = useState(null); // { lat, lng, accuracy }
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'locating' | 'success' | 'error' | 'manual'
  const [locationError, setLocationError] = useState('');

  // Step 3: Description & Category State
  const [category, setCategory] = useState('Severe Blockage');
  const [zone, setZone] = useState('Residential');
  const [description, setDescription] = useState('');
  const [waterLevel, setWaterLevel] = useState(60);

  // Form Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Preset sample photos for fast 1-click testing
  const samplePhotos = [
    {
      title: 'Choked Drain Inflow',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
      category: 'Severe Blockage',
      water: 75,
      desc: 'Heavy silt, garbage and discarded plastic bottles completely choking neighborhood storm drain intake.'
    },
    {
      title: 'Submerged Road & Sump',
      url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      category: 'Sump Overflow',
      water: 85,
      desc: 'Storm runoff water overflowing road curb. Vehicle traffic blocked and water entering residential walkways.'
    },
    {
      title: 'Dislodged Manhole Lid',
      url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
      category: 'Open Manhole Hazard',
      water: 50,
      desc: 'Cast iron manhole cover broken and open on pedestrian crossing. Urgent hazard for motorists and school kids.'
    }
  ];

  // Auto-fetch location on modal open
  useEffect(() => {
    if (isOpen) {
      handleAutoFetchLocation();
    } else {
      // Reset or clean states on close
      setErrorMsg('');
      setSubmissionResult(null);
    }
  }, [isOpen]);

  // 1. Photo Handling
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    setErrorMsg('');
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoData(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // 2. Location Fetching & Reverse Geocoding
  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationStatus('locating');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 10);
        setCoords({ lat, lng, accuracy });

        // Attempt Reverse Geocoding with OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const street = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
            const city = addr.city || addr.town || addr.county || addr.state_district || 'Metropolitan Ward';
            const postcode = addr.postcode ? ` - ${addr.postcode}` : '';
            const formatted = street ? `${street}, ${city}${postcode}` : data.display_name || `GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
            setLocationAddress(formatted);
          } else {
            setLocationAddress(`GPS Coordinates: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`);
          }
        } catch (geoErr) {
          console.warn('Reverse geocoding fallback:', geoErr);
          setLocationAddress(`GPS Coordinates: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`);
        } finally {
          setLocating(false);
          setLocationStatus('success');
        }
      },
      (err) => {
        console.warn('Geolocation acquisition error:', err.message);
        setLocating(false);
        setLocationStatus('manual');
        // Pre-fill a smart default if GPS was blocked or unavailable
        if (!locationAddress) {
          setLocationAddress('Main Arterial Sector 4, Civic Catchment Basin');
        }
        setLocationError('GPS permission was denied or unavailable. You can enter or refine your landmark address below.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // 3. Dynamic Risk Preview Calculation
  const calculatePreviewRisk = (cat, z, water) => {
    const categoryWeights = {
      'Culvert Collapse': 92,
      'Toxic Sludge & Overflow': 84,
      'Sump Overflow': 76,
      'Severe Blockage': 66,
      'Open Manhole Hazard': 62,
      'Siltation': 46,
      'Trash Grate Clog': 28,
    };
    const zoneMultipliers = {
      'Critical Health Zone': 1.35,
      'High Traffic Transit': 1.25,
      'School Safety Zone': 1.20,
      'Dense Commercial': 1.10,
      'Residential': 1.00,
      'Public Park': 0.80,
    };
    const baseWeight = categoryWeights[cat] || 50;
    const zoneMult = zoneMultipliers[z] || 1.0;
    const rawScore = (baseWeight * 0.45) + (water * 0.30) + ((baseWeight * zoneMult) * 0.25);
    return Math.min(99, Math.max(12, Math.round(rawScore)));
  };

  const previewScore = calculatePreviewRisk(category, zone, waterLevel);

  const getRiskBadge = (score) => {
    if (score >= 80) return { label: 'CRITICAL PRIORITY', bg: '#FEE2E2', border: '#EF4444', text: '#B91C1C', sla: '4 Hours Rapid Dispatch' };
    if (score >= 60) return { label: 'HIGH PRIORITY', bg: '#FEF3C7', border: '#F59E0B', text: '#B45309', sla: '12 Hours Field Response' };
    if (score >= 40) return { label: 'MODERATE CONCERN', bg: '#FEF9C3', border: '#EAB308', text: '#854D0E', sla: '24 Hours Municipal Triage' };
    return { label: 'ROUTINE CIVIC LOG', bg: '#DCFCE7', border: '#10B981', text: '#15803D', sla: '48 Hours Patrol Check' };
  };

  const riskBadge = getRiskBadge(previewScore);

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationAddress && !coords) {
      setErrorMsg('Please specify or detect your location.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a brief description of the issue.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('drainwatch_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `${category} - ${locationAddress.slice(0, 35)}`,
          category,
          location: locationAddress,
          zoneCriticality: zone,
          waterLevelPct: waterLevel,
          description: description.trim(),
          photoUrl: photoData,
          latitude: coords?.lat || null,
          longitude: coords?.lng || null,
          reportedBy: user?.fullName || 'Citizen Reporter',
          contactPhone: user?.phone || '',
          userId: user?.id || null,
          userEmail: user?.email || '',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult(data.complaint);
        if (onSuccess) onSuccess(data.complaint);
      } else {
        setErrorMsg(data.message || 'Failed to submit complaint. Please check fields.');
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setErrorMsg('Network error connecting to municipal server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 25, 47, 0.72)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem 2.25rem',
        position: 'relative'
      }}>
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-beige)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--navy-900)',
            transition: 'all 0.2s'
          }}
          title="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--navy-50)', color: 'var(--navy-600)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Citizen Rapid Hazard Reporting
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.02em', margin: 0 }}>
            Register Drainage Complaint
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Report an overflow, choke or road hazard in 3 easy steps. Real-time GPS and photos automatically accelerate municipal dispatch.
          </p>
        </div>

        {/* Success Confirmation Screen */}
        {submissionResult ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid #A7F3D0'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Complaint Registered Successfully!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
              Your issue has been logged into the DrainWatch Neon cloud cluster and prioritized for civic inspection.
            </p>

            {/* Tracking Summary Card */}
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-beige)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.75rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Incident ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {submissionResult.complaint_id}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Initial Status</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-600)' }}>
                  {submissionResult.status}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Issue Category</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  {submissionResult.category}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Target SLA</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Within {submissionResult.sla_hours_remaining || 24} Hours
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="submit-btn"
              style={{ maxWidth: '300px', margin: '0 auto' }}
            >
              View In Citizen Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="alert-banner" style={{ background: 'var(--danger-bg)', color: 'var(--danger-crimson)', border: '1px solid #FECACA', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 3 Step Indicator Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '1.75rem',
              padding: '0.35rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-beige)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: photoData ? 'var(--success-bg)' : '#FFFFFF', color: photoData ? 'var(--success-emerald)' : 'var(--navy-900)', fontSize: '0.75rem', fontWeight: 700 }}>
                {photoData ? <Check size={14} /> : <Camera size={14} color="var(--water-cyan)" />}
                <span>1. Photo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: locationStatus === 'success' ? 'var(--success-bg)' : '#FFFFFF', color: locationStatus === 'success' ? 'var(--success-emerald)' : 'var(--navy-900)', fontSize: '0.75rem', fontWeight: 700 }}>
                {locationStatus === 'success' ? <Check size={14} /> : <MapPin size={14} color="var(--water-cyan)" />}
                <span>2. GPS Location</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: description.trim() ? 'var(--success-bg)' : '#FFFFFF', color: description.trim() ? 'var(--success-emerald)' : 'var(--navy-900)', fontSize: '0.75rem', fontWeight: 700 }}>
                {description.trim() ? <Check size={14} /> : <FileText size={14} color="var(--water-cyan)" />}
                <span>3. Description</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* STEP 1: PHOTO OF THE ISSUE                                */}
            {/* ========================================================= */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-beige)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--navy-900)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>Photo of the Issue</h4>
                </div>
                {photoData && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--success-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={13} /> Photo Ready
                  </span>
                )}
              </div>

              {photoData ? (
                /* Photo Preview Container */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-beige)'
                }}>
                  <div style={{ position: 'relative', width: '100px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-beige)', flexShrink: 0 }}>
                    <img src={photoData} alt="Issue preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {photoName || 'Captured Issue Photo'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Attached to geotagged municipal report
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ background: '#FFFFFF', border: '1px solid var(--border-beige)', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--navy-900)' }}
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPhotoData(null); setPhotoName(''); }}
                        style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: 'var(--danger-crimson)' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Photo Upload Dropzone */
                <div>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? 'var(--water-cyan)' : 'var(--border-beige)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      background: isDragging ? 'var(--navy-50)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border-beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', color: 'var(--water-cyan)' }}>
                      <Camera size={22} />
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      Click to Capture Camera or Upload Photo
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Drag and drop image here (JPG, PNG, WebP up to 10MB)
                    </div>
                  </div>

                  {/* Fast 1-Click Sample Photos Option */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Or Pick Quick Test Drain Photo:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {samplePhotos.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPhotoData(s.url);
                            setPhotoName(s.title);
                            setCategory(s.category);
                            setWaterLevel(s.water);
                            if (!description) setDescription(s.desc);
                          }}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid var(--border-beige)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.5rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--navy-900)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <ImageIcon size={12} color="var(--water-cyan)" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* STEP 2: AUTOMATIC LOCATION FETCHING                       */}
            {/* ========================================================= */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-beige)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--navy-900)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>Automatic Location Detection</h4>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFetchLocation}
                  disabled={locating}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-beige)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--navy-900)',
                    cursor: locating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RefreshCw size={12} className={locating ? 'animate-spin' : ''} />
                  <span>{locating ? 'Detecting...' : 'Re-Detect GPS'}</span>
                </button>
              </div>

              {/* Location Status Bar */}
              <div style={{
                background: locationStatus === 'success' ? 'var(--success-bg)' : locating ? 'var(--navy-50)' : 'var(--bg-primary)',
                border: `1px solid ${locationStatus === 'success' ? '#A7F3D0' : 'var(--border-beige)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {locating ? (
                    <Navigation size={15} className="animate-spin" color="var(--navy-600)" />
                  ) : locationStatus === 'success' ? (
                    <CheckCircle2 size={15} color="var(--success-emerald)" />
                  ) : (
                    <Compass size={15} color="var(--warning-amber)" />
                  )}
                  <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                    {locating
                      ? 'Acquiring satellite GPS coordinates...'
                      : coords
                      ? `GPS Locked: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E (±${coords.accuracy}m)`
                      : 'Manual Address Refinement'}
                  </span>
                </div>
                {coords && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--success-emerald)', fontWeight: 700 }}>
                    ACCURACY HIGH
                  </span>
                )}
              </div>

              {/* Editable Location Field */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>
                  Detected Street Address / Landmark Name (Auto-Populated)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                    placeholder="e.g. 42 West Canal Avenue, Sector 5 Basin"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    required
                  />
                  <MapPin size={16} color="var(--water-cyan)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                {locationError && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--warning-amber)', marginTop: '0.35rem' }}>
                    {locationError}
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================= */}
            {/* STEP 3: DESCRIPTION & ISSUE DETAILS                       */}
            {/* ========================================================= */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-beige)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--navy-900)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3</div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>Description of the Issue</h4>
              </div>

              {/* Category Selection */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Issue Classification</label>
                <select
                  className="input-field"
                  style={{ paddingLeft: '0.75rem', fontSize: '0.85rem' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Severe Blockage">Severe Blockage (Solid Waste / Silt)</option>
                  <option value="Sump Overflow">Sump / Catchment Basin Overflow</option>
                  <option value="Open Manhole Hazard">Open / Damaged Manhole Lid</option>
                  <option value="Toxic Sludge & Overflow">Toxic Sludge & Foul Chemical Runoff</option>
                  <option value="Culvert Collapse">Culvert / Retaining Wall Collapse</option>
                  <option value="Siltation">Slow Drainage Siltation</option>
                  <option value="Trash Grate Clog">Surface Trash Grate Clog</option>
                </select>
              </div>

              {/* Description Textarea */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Detailed Observation & Hazard Impact</label>
                <textarea
                  className="input-field"
                  style={{ padding: '0.75rem', minHeight: '80px', fontSize: '0.85rem' }}
                  placeholder="Describe the condition: e.g. Water is stagnant for 2 days, foul smell, overflowing onto sidewalk, blocking pedestrian traffic..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                style={{ flex: 2, margin: 0 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className="animate-spin" /> Lodging Geotagged Report...
                  </span>
                ) : (
                  'Submit Citizen Complaint'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
