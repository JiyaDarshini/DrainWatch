import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Navigation, 
  Image as ImageIcon,
  Eye,
  X,
  Sparkles,
  PhoneCall,
  Shield,
  HelpCircle
} from 'lucide-react';
import CitizenComplaintModal from './CitizenComplaintModal';
import ComplaintDetailModal from './ComplaintDetailModal';
import { safeJson } from '../utils/api';

export default function CitizenDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Active' | 'Resolved'

  const fetchData = async () => {
    setLoading(true);
    let localList = [];
    try {
      localList = JSON.parse(localStorage.getItem('drainwatch_local_complaints') || '[]');
    } catch (e) {
      localList = [];
    }

    try {
      const token = localStorage.getItem('drainwatch_token');
      const params = new URLSearchParams({
        sortBy: 'created_at',
        order: 'DESC',
        onlyMine: 'true',
      });

      if (user?.id) params.append('userId', user.id);
      if (user?.email) params.append('userEmail', user.email);
      if (user?.phone) params.append('phone', user.phone);
      if (user?.fullName) params.append('reportedBy', user.fullName);

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/complaints?${params.toString()}`, { headers });
      const cData = await safeJson(res);
      if (res.ok && cData.complaints) {
        const map = new Map();
        localList.forEach(c => map.set(c.complaint_id || c.id, c));
        cData.complaints.forEach(c => map.set(c.complaint_id || c.id, c));
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setComplaints(merged);
        return;
      }
    } catch (err) {
      console.warn('Backend complaints fetch deferred, using local storage:', err);
    } finally {
      setLoading(false);
    }

    setComplaints(localList);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [user?.id, user?.email, user?.phone]);

  const handleComplaintSuccess = (newComplaint) => {
    fetchData();
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Resolved': return 4;
      case 'In Progress': return 3;
      case 'Critical Dispatch': return 2;
      default: return 1; // 'Pending Inspection' / 'Under Review'
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterTab === 'Active') return c.status !== 'Resolved';
    if (filterTab === 'Resolved') return c.status === 'Resolved';
    return true;
  });

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Citizen Action Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 60%, #0F223D 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2.5rem',
        color: '#FFFFFF',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        {/* Glow ambient background circle */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.35) 0%, rgba(2, 132, 199, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#38BDF8',
              marginBottom: '0.85rem'
            }}>
              <Sparkles size={14} /> Citizen Action & Civic Response
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              Report a Drainage Hazard
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Upload a <strong>photo</strong> of the issue, let GPS <strong>automatically fetch your location</strong>, and provide a brief <strong>description</strong>. Municipal field response teams are notified immediately.
            </p>

            {/* 3 Steps Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#E2E8F0' }}>
                <Camera size={14} color="#38BDF8" />
                <span>1. Photo of Issue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#E2E8F0' }}>
                <Navigation size={14} color="#38BDF8" />
                <span>2. Auto-GPS Location</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#E2E8F0' }}>
                <FileText size={14} color="#38BDF8" />
                <span>3. Issue Description</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.85rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <PlusCircle size={18} /> Register Complaint Now
            </button>
          </div>

          {/* Quick Stats Pill Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            minWidth: '240px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              My Civic Reports
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {complaints.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Total Lodged</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8' }}>
                  {complaints.filter(c => c.status !== 'Resolved').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>In Progress</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>
                  {complaints.filter(c => c.status === 'Resolved').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Resolved</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#FCD34D' }}>
                  24/7
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Civic Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Complaints Tracker Section */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-md)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem'
      }}>
        {/* Header & Filter Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
              Registered Complaints & Live Status
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Track real-time inspection, field dispatch, and closure for all geotagged drainage reports.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-beige)' }}>
              {['All', 'Active', 'Resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  style={{
                    background: filterTab === tab ? '#FFFFFF' : 'transparent',
                    color: filterTab === tab ? 'var(--navy-900)' : 'var(--text-muted)',
                    border: 'none',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: filterTab === tab ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: filterTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab} ({tab === 'All' ? complaints.length : tab === 'Active' ? complaints.filter(c => c.status !== 'Resolved').length : complaints.filter(c => c.status === 'Resolved').length})
                </button>
              ))}
            </div>

            <button
              onClick={fetchData}
              className="btn-secondary-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
              title="Refresh complaints"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Complaints List / Grid */}
        {filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--text-muted)' }}>
              <FileText size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>No complaints found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0.25rem auto 1.25rem' }}>
              No complaints in this filter. Register an issue with photo & GPS to report a civic drainage problem.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="submit-btn"
              style={{ maxWidth: '240px', margin: '0 auto' }}
            >
              <PlusCircle size={16} /> Lodge Complaint
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredComplaints.map((item) => {
              const step = getStatusStep(item.status);

              return (
                <div
                  key={item.id || item.complaint_id}
                  onClick={() => setSelectedComplaint(item)}
                  style={{
                    border: '1px solid var(--border-beige)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1.5rem',
                    background: '#FFFFFF',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 2px 6px rgba(10, 25, 47, 0.03)',
                    cursor: 'pointer'
                  }}
                  title="Click to view full description, photo & risk analysis"
                >
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Photo Thumbnail */}
                    {item.photo_url ? (
                      <div
                        onClick={() => setSelectedPhoto(item.photo_url)}
                        style={{
                          position: 'relative',
                          width: '130px',
                          height: '100px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-beige)',
                          cursor: 'pointer',
                          flexShrink: 0,
                          background: 'var(--bg-secondary)'
                        }}
                        title="Click to view full photo"
                      >
                        <img
                          src={item.photo_url}
                          alt="Reported drain hazard"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(10, 25, 47, 0.35)',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                          <Eye size={20} />
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#FFF',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <Camera size={10} /> Photo
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        width: '130px',
                        height: '100px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-primary)',
                        border: '1px dashed var(--border-beige)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-light)',
                        flexShrink: 0,
                        fontSize: '0.72rem'
                      }}>
                        <ImageIcon size={22} style={{ marginBottom: '0.2rem', opacity: 0.6 }} />
                        <span>No Photo</span>
                      </div>
                    )}

                    {/* Complaint Details */}
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-600)', background: 'var(--navy-50)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {item.complaint_id}
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                            {item.title}
                          </h4>
                        </div>

                        {/* Category Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.65rem',
                            borderRadius: '999px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--navy-900)',
                            border: '1px solid var(--border-beige)'
                          }}>
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Location & GPS Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                        <MapPin size={14} color="var(--water-cyan)" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{item.location}</span>
                        {item.latitude && item.longitude && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', background: 'var(--bg-secondary)', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                            GPS: {parseFloat(item.latitude).toFixed(4)}°, {parseFloat(item.longitude).toFixed(4)}°
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', background: 'var(--bg-primary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '0.85rem' }}>
                          "{item.description}"
                        </p>
                      )}

                      {/* 4-Step Resolution Progress Bar */}
                      <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--border-beige)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                          <span style={{ color: step >= 1 ? 'var(--navy-900)' : 'inherit' }}>1. Submitted</span>
                          <span style={{ color: step >= 2 ? 'var(--navy-900)' : 'inherit' }}>2. Dispatched</span>
                          <span style={{ color: step >= 3 ? 'var(--navy-900)' : 'inherit' }}>3. In Progress</span>
                          <span style={{ color: step >= 4 ? 'var(--success-emerald)' : 'inherit' }}>4. Resolved</span>
                        </div>

                        {/* Progress Line */}
                        <div style={{ width: '100%', height: '6px', background: '#CBD5E1', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: step === 4 ? '100%' : step === 3 ? '75%' : step === 2 ? '45%' : '20%',
                            height: '100%',
                            background: step === 4 ? 'var(--success-emerald)' : step >= 2 ? 'var(--navy-600)' : 'var(--warning-amber)',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', fontSize: '0.72rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            Status: <strong style={{ color: item.status === 'Resolved' ? 'var(--success-emerald)' : 'var(--navy-900)' }}>{item.status}</strong>
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            Target SLA: <strong style={{ color: 'var(--navy-900)' }}>Within {item.sla_hours_remaining || 24}h</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Civic Assistance & Drain Safety Guidelines (Citizen-Centric) */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem 1.75rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <PhoneCall size={18} color="var(--navy-600)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
              24/7 Civic Flood & Drainage Helpline
            </h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            For emergency waterlogging, broken main pipelines or open manhole hazards requiring immediate cordoning:
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--navy-50)', color: 'var(--navy-600)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              📞 1800-425-0012
            </span>
            <span style={{ background: 'var(--navy-50)', color: 'var(--navy-600)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              📞 1913 (Monsoon Control)
            </span>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--success-emerald)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
              Citizen Safety Reminders
            </h4>
          </div>
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
            <li>Avoid walking or driving through submerged roads with hidden manholes.</li>
            <li>Do not dispose of plastic waste into open storm drains or culvert intakes.</li>
            <li>Photos with visible landmarks help municipal crews locate hazards faster.</li>
          </ul>
        </div>
      </div>

      {/* Citizen Complaint Modal */}
      <CitizenComplaintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleComplaintSuccess}
        user={user}
      />

      {/* Complaint Detail & Analysis Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        userRole="Citizen"
      />

      {/* Full Resolution Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 17, 32, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1.5rem',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '850px',
              maxHeight: '85vh',
              background: '#0A192F',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#FFF',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
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
              src={selectedPhoto}
              alt="Geotagged Incident Photo Preview"
              style={{
                width: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div style={{ padding: '0.85rem 1.25rem', background: '#0A192F', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Citizen Verified Incident Evidence</span>
              <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>DrainWatch Telemetry Archive</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
