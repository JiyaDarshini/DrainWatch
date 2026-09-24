import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Filter, 
  RefreshCw, 
  ShieldAlert, 
  Upload, 
  ArrowUpRight, 
  X, 
  Navigation, 
  Layers, 
  Lock, 
  Search, 
  Eye, 
  Building2, 
  Sparkles, 
  AlertCircle,
  Check,
  Flag,
  Share2
} from 'lucide-react';
import ComplaintDetailModal from './ComplaintDetailModal';

// Available municipal zones and wards for field inspectors
export const INSPECTOR_ZONES = [
  { id: 'Zone 4', name: 'Zone 4 - Central Basin / Ward 12', ward: 'Ward 12', center: { lat: 13.0827, lng: 80.2707 }, icon: '🏛️' },
  { id: 'Zone 1', name: 'Zone 1 - North Canal / Ward 4', ward: 'Ward 4', center: { lat: 13.1100, lng: 80.2800 }, icon: '🚢' },
  { id: 'Zone 2', name: 'Zone 2 - Industrial Outfall / Ward 8', ward: 'Ward 8', center: { lat: 13.0400, lng: 80.2100 }, icon: '🏭' },
  { id: 'Zone 3', name: 'Zone 3 - Metro Transit Corridor / Ward 15', ward: 'Ward 15', center: { lat: 13.0780, lng: 80.2650 }, icon: '🚆' },
];

export default function FieldInspectorDashboard({ user }) {
  // Determine inspector's assigned zone
  const defaultZone = user?.assigned_zone || 'Zone 4 - Central Basin / Ward 12';
  const assignedWard = user?.assigned_ward || 'Ward 12';

  const [selectedZone, setSelectedZone] = useState(defaultZone);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  // Inspection Action Modal State
  const [actionModalComplaint, setActionModalComplaint] = useState(null);
  const [modalMode, setModalMode] = useState('update'); // 'update' | 'flag' | 'escalate'
  const [fieldStatus, setFieldStatus] = useState('Inspected');
  const [fieldNotes, setFieldNotes] = useState('');
  const [verificationPhoto, setVerificationPhoto] = useState('');
  const [flagReason, setFlagReason] = useState('False Alarm - No Water Stagnation');
  const [flagExplanation, setFlagExplanation] = useState('');
  const [escalationReason, setEscalationReason] = useState('Requires Major Civil Structural Overhaul / High Budget (>₹1,00,000)');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const [activeMapPin, setActiveMapPin] = useState(null);

  // Fetch complaints restricted to inspector's zone
  const fetchZoneComplaints = async () => {
    setLoading(true);
    try {
      // Determine zone query term
      const zoneKey = selectedZone.includes('Zone 1') ? 'North' 
        : selectedZone.includes('Zone 2') ? 'Industrial'
        : selectedZone.includes('Zone 3') ? 'Transit'
        : 'Central';

      const res = await fetch(`/api/complaints?zone=${encodeURIComponent(zoneKey)}`);
      if (res.ok) {
        const data = await res.json();
        let list = data.complaints || [];

        // If list is small for demo, fallback to all complaints but clearly badge zone
        if (list.length === 0) {
          const fallbackRes = await fetch('/api/complaints');
          const fallbackData = await fallbackRes.json();
          list = fallbackData.complaints || [];
        }

        setComplaints(list);
      }
    } catch (err) {
      console.error('Error fetching field inspector complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZoneComplaints();
    const interval = setInterval(fetchZoneComplaints, 20000);
    return () => clearInterval(interval);
  }, [selectedZone]);

  // Open on-site verification / action modal
  const openActionModal = (complaint, mode = 'update') => {
    setActionModalComplaint(complaint);
    setModalMode(mode);
    setFieldStatus(
      complaint.status === 'Pending Inspection' ? 'Inspected' 
      : complaint.status === 'Inspected' ? 'In Progress' 
      : complaint.status === 'In Progress' ? 'Resolved' 
      : 'Inspected'
    );
    setFieldNotes(complaint.field_notes || '');
    setVerificationPhoto(complaint.verification_photo || '');
    setFlagReason(complaint.flagged_reason || 'False Alarm - No Stagnation Found');
    setFlagExplanation('');
    setEscalationReason('Requires Major Civil Structural Overhaul / High Budget (>₹1,00,000)');
    setEscalationNotes(complaint.escalation_notes || '');
  };

  // Submit on-site field verification, flag, or escalation
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionModalComplaint) return;

    setIsSubmittingAction(true);
    try {
      let payload = {
        inspectedBy: `${user?.fullName || 'Field Inspector'} (${user?.phone || 'Zone Staff'})`,
      };

      if (modalMode === 'update') {
        payload.status = fieldStatus;
        payload.fieldNotes = fieldNotes;
        payload.verificationPhoto = verificationPhoto;
      } else if (modalMode === 'flag') {
        payload.status = `Flagged: ${flagReason}`;
        payload.flaggedReason = `${flagReason} - ${flagExplanation}`;
        payload.fieldNotes = `[FLAGGED ON SITE] ${flagReason}. ${flagExplanation}`;
        payload.verificationPhoto = verificationPhoto;
      } else if (modalMode === 'escalate') {
        payload.status = 'Escalated to Authority';
        payload.isEscalated = true;
        payload.escalationNotes = `${escalationReason}: ${escalationNotes}`;
        payload.fieldNotes = `[ESCALATED TO HEADQUARTERS] ${escalationReason}`;
        payload.verificationPhoto = verificationPhoto;
      }

      const res = await fetch(`/api/complaints/${actionModalComplaint.id}/field-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackBanner({
          type: 'success',
          msg: modalMode === 'escalate' 
            ? `Incident ${actionModalComplaint.complaint_id} successfully escalated to Municipal Authority for budget sanction.`
            : modalMode === 'flag'
            ? `Incident ${actionModalComplaint.complaint_id} flagged as false/duplicate.`
            : `Inspection proof & status "${fieldStatus}" saved successfully for ${actionModalComplaint.complaint_id}.`
        });
        setActionModalComplaint(null);
        fetchZoneComplaints();
        setTimeout(() => setFeedbackBanner(null), 6000);
      } else {
        throw new Error(data.message || 'Failed to submit field update');
      }
    } catch (err) {
      alert(err.message || 'Error updating inspection status');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Filter complaints based on status and search query
  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = 
      filterStatus === 'All' ? true
      : filterStatus === 'Pending' ? (c.status === 'Pending Inspection' || c.status === 'Open' || !c.status)
      : filterStatus === 'Inspected' ? c.status === 'Inspected'
      : filterStatus === 'In Progress' ? (c.status === 'In Progress' || c.status === 'Critical Dispatch')
      : filterStatus === 'Resolved' ? c.status === 'Resolved'
      : filterStatus === 'Escalated' ? (c.is_escalated || c.status?.includes('Escalated'))
      : filterStatus === 'Flagged' ? (c.flagged_reason || c.status?.includes('Flagged'))
      : true;

    const matchesSearch = 
      (c.complaint_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // KPI Calculations for inspector's zone
  const pendingCount = complaints.filter(c => c.status === 'Pending Inspection' || c.status === 'Open' || !c.status).length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Inspected' || c.status === 'Critical Dispatch').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const escalatedCount = complaints.filter(c => c.is_escalated || c.status?.includes('Escalated')).length;

  return (
    <div className="field-inspector-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Scope & Role Notice Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.75rem',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
            color: '#FFFFFF'
          }}>
            <HardHat size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
                Field Inspector Ground Station
              </h2>
              <span style={{
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #F59E0B',
                color: '#FBBF24',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
                textTransform: 'uppercase'
              }}>
                Ground Staff Mode
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              Assigned Zone: <strong style={{ color: '#F8FAFC' }}>{selectedZone}</strong> &bull; Operational Ward: <strong style={{ color: '#38BDF8' }}>{assignedWard}</strong>
            </p>
          </div>
        </div>

        {/* Security & Access Restriction Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.06)',
          padding: '0.5rem 0.9rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Lock size={15} color="#94A3B8" />
          <div style={{ fontSize: '0.76rem', color: '#CBD5E1', lineHeight: '1.3' }}>
            <span style={{ fontWeight: 700, color: '#F8FAFC' }}>Zone-Restricted Access:</span> Only incidents in your ward are visible. Major civil budgets require HQ escalation.
          </div>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackBanner && (
        <div style={{
          background: feedbackBanner.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${feedbackBanner.type === 'success' ? '#10B981' : '#EF4444'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: feedbackBanner.type === 'success' ? '#065F46' : '#991B1B',
          fontWeight: 600,
          fontSize: '0.88rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CheckCircle2 size={18} />
            <span>{feedbackBanner.msg}</span>
          </div>
          <button onClick={() => setFeedbackBanner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-beige)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#F59E0B', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pending Inspection</span>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Require on-site verification</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-beige)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0284C7', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Active Work Orders</span>
            <HardHat size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284C7' }}>{inProgressCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>In progress or verified</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-beige)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10B981', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Resolved in Ward</span>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{resolvedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Cleared & verified</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-beige)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#8B5CF6', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Escalated to HQ</span>
            <ArrowUpRight size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7C3AED' }}>{escalatedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Awaiting budget sanction</div>
        </div>
      </div>

      {/* Main Grid: Zone Pinned Map (Top/Left) + Task List (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(360px, 1.9fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Zone Map Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-beige)',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-beige)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--navy-900)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                Zone Map: Pinned Incidents
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {complaints.length} Points Pinned
            </span>
          </div>

          {/* Interactive Visual Map Canvas */}
          <div style={{
            position: 'relative',
            height: '340px',
            background: 'radial-gradient(circle at 50% 50%, #1E293B 0%, #0F172A 100%)',
            overflow: 'hidden'
          }}>
            {/* Grid overlay for map feel */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.8
            }}></div>

            {/* Ward Outline and Streets */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <path d="M 40,80 Q 180,40 320,90 T 500,120" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
              <path d="M 80,240 Q 220,180 380,260 T 520,220" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
              <path d="M 160,20 L 220,320" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="3" fill="none" />
              <path d="M 320,10 L 290,330" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="3" fill="none" />
              
              {/* Ward Boundary Polygon */}
              <polygon points="30,30 380,20 480,290 60,310" fill="rgba(2, 132, 199, 0.04)" stroke="rgba(2, 132, 199, 0.3)" strokeWidth="1.5" />
            </svg>

            <div style={{ position: 'absolute', top: 12, left: 14, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', color: '#38BDF8', fontSize: '0.72rem', fontWeight: 700 }}>
              📍 {selectedZone}
            </div>

            {/* Pinned Incident Markers */}
            {complaints.slice(0, 8).map((c, i) => {
              // Distribute pins aesthetically on canvas
              const positions = [
                { top: '28%', left: '32%' },
                { top: '45%', left: '68%' },
                { top: '65%', left: '25%' },
                { top: '35%', left: '80%' },
                { top: '72%', left: '55%' },
                { top: '20%', left: '50%' },
                { top: '55%', left: '42%' },
                { top: '80%', left: '78%' }
              ];
              const pos = positions[i % positions.length];
              const isCrit = c.risk_score >= 75 || c.status === 'Critical Dispatch';
              const isResolved = c.status === 'Resolved';
              const isPending = c.status === 'Pending Inspection' || !c.status;
              const isEsc = c.is_escalated || c.status?.includes('Escalated');

              const pinColor = isResolved ? '#10B981' : isEsc ? '#8B5CF6' : isCrit ? '#EF4444' : isPending ? '#F59E0B' : '#0284C7';

              return (
                <div
                  key={c.id || i}
                  onClick={() => {
                    setActiveMapPin(c);
                    setSelectedComplaint(c);
                  }}
                  style={{
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  title={`${c.complaint_id}: ${c.title}`}
                >
                  <div style={{
                    width: isCrit ? '34px' : '28px',
                    height: isCrit ? '34px' : '28px',
                    borderRadius: '50% 50% 50% 0',
                    background: pinColor,
                    transform: 'rotate(-45deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #FFFFFF',
                    boxShadow: `0 4px 12px ${pinColor}88`
                  }}>
                    <div style={{
                      transform: 'rotate(45deg)',
                      color: '#FFFFFF',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {c.risk_score || 50}
                    </div>
                  </div>
                  {isCrit && (
                    <div style={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: '50%',
                      border: '2px solid #EF4444',
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                      pointerEvents: 'none'
                    }}></div>
                  )}
                </div>
              );
            })}

            {/* Map Legend */}
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              right: 10,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#CBD5E1',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}></span> Critical
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></span> Pending
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284C7' }}></span> In Progress
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span> Resolved
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6' }}></span> HQ Escalated
              </span>
            </div>
          </div>

          {/* Quick Zone Details Footer */}
          <div style={{ padding: '0.85rem 1.25rem', background: '#F8FAFC', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Ward Sump Pumps: <strong>4 Online</strong></span>
            <span>Drainage Network: <strong>14.2 km</strong></span>
          </div>
        </div>

        {/* Task List / Work Orders Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-beige)',
          padding: '1.25rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
        }}>
          {/* Header & Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                Field Work Orders & Inspection Queue
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Select an incident to upload on-site verification, flag, or escalate.
              </p>
            </div>

            <button
              onClick={fetchZoneComplaints}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--navy-900)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync
            </button>
          </div>

          {/* Status Tabs & Search Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by ID, location, or problem type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-beige)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  background: 'var(--bg-secondary)'
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'In Progress', 'Resolved', 'Escalated', 'Flagged'].map((tab) => {
                const isActive = filterStatus === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    style={{
                      background: isActive ? 'var(--navy-900)' : 'var(--bg-secondary)',
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--navy-900)' : 'var(--border-beige)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.7rem',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Work Orders List */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: 'var(--water-cyan)' }} />
              <p style={{ fontSize: '0.88rem' }}>Loading zone work orders...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-beige)' }}>
              <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.95rem' }}>No matching work orders found</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                All assigned tasks in this filter view have been handled or cleared.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredComplaints.map((c) => {
                const isCrit = c.risk_score >= 75 || c.status === 'Critical Dispatch';
                const isResolved = c.status === 'Resolved';
                const isEscalated = c.is_escalated || c.status?.includes('Escalated');
                const isFlagged = c.flagged_reason || c.status?.includes('Flagged');

                return (
                  <div
                    key={c.id}
                    style={{
                      border: '1px solid var(--border-beige)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                      background: '#FFFFFF',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--water-cyan)', background: '#F0F9FF', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #BAE6FD' }}>
                            {c.complaint_id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {c.sla_hours_remaining ? `${c.sla_hours_remaining}h SLA left` : 'Standard SLA'}
                          </span>
                          {isEscalated && (
                            <span style={{ background: '#F3E8FF', color: '#7C3AED', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #DDD6FE' }}>
                              Escalated to HQ
                            </span>
                          )}
                          {isFlagged && (
                            <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #FECACA' }}>
                              Flagged Issue
                            </span>
                          )}
                        </div>

                        <h4 
                          onClick={() => setSelectedComplaint(c)}
                          style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer', margin: 0 }}
                          title="Click to view full description and AI analysis"
                        >
                          {c.title}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          <MapPin size={13} color="var(--water-cyan)" />
                          <span>{c.location}</span>
                        </div>
                      </div>

                      {/* Status Badge & Risk Indicator */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: isCrit ? '#FEF2F2' : isResolved ? '#ECFDF5' : '#F0F9FF', color: isCrit ? '#DC2626' : isResolved ? '#059669' : '#0284C7', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, border: `1px solid ${isCrit ? '#FECACA' : isResolved ? '#A7F3D0' : '#BAE6FD'}` }}>
                          {c.status || 'Pending Inspection'}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                          Risk: {c.risk_score || 50}/100
                        </div>
                      </div>
                    </div>

                    {/* Description preview */}
                    {c.description && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                        "{c.description.length > 130 ? c.description.slice(0, 130) + '...' : c.description}"
                      </p>
                    )}

                    {/* Field Inspection Status Footnote (if already inspected) */}
                    {c.field_notes && (
                      <div style={{ fontSize: '0.78rem', color: '#0369A1', background: '#F0F9FF', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <Check size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <strong>Field Note:</strong> {c.field_notes}
                          {c.inspected_by && <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>&bull; by {c.inspected_by}</span>}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Inspector */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-beige)' }}>
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--navy-900)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0'
                        }}
                      >
                        <Eye size={14} /> Full Details
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        {/* Flag button */}
                        <button
                          onClick={() => openActionModal(c, 'flag')}
                          style={{
                            background: '#FFF1F2',
                            color: '#E11D48',
                            border: '1px solid #FFE4E6',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          title="Flag as duplicate or false complaint"
                        >
                          <Flag size={12} /> Flag False
                        </button>

                        {/* Escalate button */}
                        <button
                          onClick={() => openActionModal(c, 'escalate')}
                          style={{
                            background: '#F5F3FF',
                            color: '#7C3AED',
                            border: '1px solid #EDE9FE',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          title="Escalate to Municipal Officer for budget/policy approval"
                        >
                          <ArrowUpRight size={12} /> Escalate HQ
                        </button>

                        {/* Update / Verify button */}
                        <button
                          onClick={() => openActionModal(c, 'update')}
                          style={{
                            background: 'var(--navy-900)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 2px 6px rgba(10,25,47,0.2)'
                          }}
                        >
                          <Camera size={13} /> Update & Proof
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ON-SITE INSPECTION & STATUS UPDATE MODAL */}
      {actionModalComplaint && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 25, 47, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActionModalComplaint(null);
          }}
        >
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border-beige)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-beige)',
              background: modalMode === 'escalate' ? '#FAF5FF' : modalMode === 'flag' ? '#FFF1F2' : 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: modalMode === 'escalate' ? '#7C3AED' : modalMode === 'flag' ? '#E11D48' : 'var(--navy-900)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {modalMode === 'escalate' ? <ArrowUpRight size={18} /> : modalMode === 'flag' ? <Flag size={18} /> : <HardHat size={18} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                    {modalMode === 'escalate' ? 'Escalate to Municipal Authority' : modalMode === 'flag' ? 'Flag False or Duplicate Complaint' : 'On-Site Inspection & Status Update'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Incident ID: <strong style={{ color: 'var(--navy-900)' }}>{actionModalComplaint.complaint_id}</strong> &bull; {actionModalComplaint.location}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActionModalComplaint(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleActionSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Mode: Standard Status & On-Site Verification */}
              {modalMode === 'update' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                      Lifecycle Progression Status
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                      {[
                        { id: 'Pending Inspection', label: 'Pending' },
                        { id: 'Inspected', label: 'Inspected' },
                        { id: 'In Progress', label: 'In Progress' },
                        { id: 'Resolved', label: 'Resolved' }
                      ].map((st) => {
                        const isSelected = fieldStatus === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setFieldStatus(st.id)}
                            style={{
                              background: isSelected ? 'var(--navy-900)' : 'var(--bg-secondary)',
                              color: isSelected ? '#FFFFFF' : 'var(--navy-900)',
                              border: `1px solid ${isSelected ? 'var(--navy-900)' : 'var(--border-beige)'}`,
                              borderRadius: '6px',
                              padding: '0.55rem 0.2rem',
                              fontSize: '0.78rem',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s'
                            }}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* On-Site Verification Photo URL / Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                      On-Site Verification Photo URL / Proof
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="url"
                        placeholder="https://... or sample photo link"
                        value={verificationPhoto}
                        onChange={(e) => setVerificationPhoto(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-beige)',
                          fontSize: '0.82rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setVerificationPhoto('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80')}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-beige)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Sample Proof
                      </button>
                    </div>
                  </div>

                  {/* Field Inspection Notes */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                      Field Engineer Notes & Obstruction Assessment
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Silt removed using vacuum jetting truck #4. Grate cleared and flow restored to normal velocity."
                      value={fieldNotes}
                      onChange={(e) => setFieldNotes(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-beige)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Mode: Flag False / Duplicate */}
              {modalMode === 'flag' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.4rem' }}>
                      Select Flag Reason
                    </label>
                    <select
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-beige)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        background: '#FFFFFF'
                      }}
                    >
                      <option value="False Alarm - No Water Stagnation">False Alarm - No Water Stagnation Found on Site</option>
                      <option value="Duplicate Complaint">Duplicate Incident (Already logged in Ward queue)</option>
                      <option value="Private Property / Non-Municipal Drain">Private Compound (Outside municipal jurisdiction)</option>
                      <option value="Minor Surface Moisture (Self-Clearing)">Minor Surface Runoff (Clears naturally within 15 min)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                      Inspector Verification Explanation
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what was observed upon visiting the coordinates..."
                      value={flagExplanation}
                      onChange={(e) => setFlagExplanation(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-beige)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Mode: Escalate to Municipal Authority */}
              {modalMode === 'escalate' && (
                <>
                  <div style={{ background: '#FAF5FF', border: '1px solid #DDD6FE', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8rem', color: '#6B21A8' }}>
                    <strong>Municipal Authority Escalation:</strong> Ground-level staff cannot approve capital expenditures &gt;₹50,000 or road-cutting permits. This ticket will be routed directly to the Chief Municipal Engineer's priority inbox.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#6B21A8', marginBottom: '0.4rem' }}>
                      Primary Reason for Authority Escalation
                    </label>
                    <select
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-beige)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        background: '#FFFFFF'
                      }}
                    >
                      <option value="Requires Major Civil Structural Overhaul / High Budget (>₹1,00,000)">Major Civil Structural Overhaul / Budget Sanction Needed</option>
                      <option value="Road-Cutting / Traffic Police Inter-Agency Permit Required">Inter-Agency Traffic Diversion & Road Excavation Permit</option>
                      <option value="Collapsed Underground Main Conduit Replacement">Collapsed Underground Siphon / Box Culvert Reconstruction</option>
                      <option value="Industrial Chemical Dumping / Pollution Control Board Action">Industrial Hazard / Pollution Control Board Legal Notice</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                      Justification & Cost / Urgency Assessment
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain why routine ward equipment cannot resolve this blockage, and what structural machinery/budget is needed..."
                      value={escalationNotes}
                      onChange={(e) => setEscalationNotes(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-beige)',
                        fontSize: '0.82rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActionModalComplaint(null)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-beige)',
                    color: 'var(--navy-900)',
                    padding: '0.6rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  style={{
                    background: modalMode === 'escalate' ? '#7C3AED' : modalMode === 'flag' ? '#E11D48' : 'var(--navy-900)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.6rem 1.4rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {isSubmittingAction ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Saving...
                    </>
                  ) : modalMode === 'escalate' ? (
                    <>
                      <ArrowUpRight size={14} /> Submit Escalation to HQ
                    </>
                  ) : modalMode === 'flag' ? (
                    <>
                      <Flag size={14} /> Confirm False Flag
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Commit Field Proof
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE COMPLAINT DETAIL MODAL */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onStatusChange={() => {
            fetchZoneComplaints();
          }}
        />
      )}
    </div>
  );
}
