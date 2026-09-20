import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Filter, 
  PlusCircle, 
  ArrowUpDown, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Sliders, 
  Layers, 
  X, 
  Send,
  Droplets,
  Radio,
  CheckCircle,
  Truck,
  RefreshCw,
  Search
} from 'lucide-react';

export default function RiskComplaintsVisualizer({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Critical' | 'High' | 'Medium' | 'Low' | 'Pending' | 'Resolved'
  const [sortBy, setSortBy] = useState('risk_score'); // 'risk_score' | 'water_level_pct' | 'sla_hours_remaining'
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // New Complaint Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Severe Blockage');
  const [newLocation, setNewLocation] = useState('');
  const [newZone, setNewZone] = useState('Residential');
  const [newWaterLevel, setNewWaterLevel] = useState(65);
  const [newDescription, setNewDescription] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Complaints & Analytics
  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, anaRes] = await Promise.all([
        fetch(`/api/complaints?sortBy=${sortBy}`),
        fetch('/api/complaints/analytics')
      ]);

      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(compData.complaints || []);
      }

      if (anaRes.ok) {
        const anaData = await anaRes.json();
        setAnalytics(anaData);
      }
    } catch (err) {
      console.error('Error fetching complaints data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sortBy]);

  // Update Status
  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Live Risk Calculation Preview in Modal
  const computeLiveRisk = (cat, zone, water) => {
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
    const zoneMult = zoneMultipliers[zone] || 1.0;
    const rawScore = (baseWeight * 0.45) + (water * 0.30) + ((baseWeight * zoneMult) * 0.25);
    return Math.min(99, Math.max(12, Math.round(rawScore)));
  };

  const previewRiskScore = computeLiveRisk(newCategory, newZone, newWaterLevel);

  // Submit Complaint
  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!newTitle || !newLocation) return;

    setIsSubmitting(true);
    setSubmitMsg('');

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          location: newLocation,
          zoneCriticality: newZone,
          waterLevelPct: newWaterLevel,
          reportedBy: user?.fullName || 'Field Terminal Officer',
          contactPhone: user?.phone || '',
          description: newDescription,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitMsg(`Success! Incident lodged with Risk Score: ${data.complaint.risk_score}/100`);
        setTimeout(() => {
          setShowModal(false);
          setSubmitMsg('');
          setNewTitle('');
          setNewLocation('');
          setNewDescription('');
          loadData();
        }, 1200);
      }
    } catch (err) {
      console.error('Error creating complaint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    // Search query filter
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complaint_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category / Severity filter
    if (activeFilter === 'Critical') return c.risk_score >= 80;
    if (activeFilter === 'High') return c.risk_score >= 60 && c.risk_score < 80;
    if (activeFilter === 'Medium') return c.risk_score >= 40 && c.risk_score < 60;
    if (activeFilter === 'Low') return c.risk_score < 40;
    if (activeFilter === 'Active') return c.status !== 'Resolved';
    if (activeFilter === 'Resolved') return c.status === 'Resolved';
    return true;
  });

  const getRiskColor = (score) => {
    if (score >= 80) return { bg: '#FEE2E2', border: '#EF4444', text: '#B91C1C', label: 'CRITICAL HAZARD' };
    if (score >= 60) return { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309', label: 'HIGH RISK' };
    if (score >= 40) return { bg: '#FEF9C3', border: '#EAB308', text: '#854D0E', label: 'MODERATE RISK' };
    return { bg: '#DCFCE7', border: '#10B981', text: '#15803D', label: 'LOW CONCERN' };
  };

  return (
    <div style={{ marginTop: '2.5rem' }}>
      {/* Section Header & Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              background: 'var(--navy-900)',
              color: '#FFFFFF',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              Automated Algorithm Engine
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Synchronized with Neon DB</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--navy-900)' }}>
            Complaints Risk Ranking & Vulnerability Matrix
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            className="btn-secondary-outline"
            style={{ width: 'auto', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Rankings
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="submit-btn"
            style={{ width: 'auto', margin: 0, padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
          >
            <PlusCircle size={16} /> File New Complaint
          </button>
        </div>
      </div>

      {/* 4 Analytics KPI Cards */}
      <div className="dash-stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div className="stat-icon-wrapper" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <Flame size={22} />
          </div>
          <div className="stat-val" style={{ color: '#DC2626' }}>
            {analytics?.summary?.criticalCount || 0}
          </div>
          <div className="stat-label">Critical Tier (Score 80–100)</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="stat-val" style={{ color: '#D97706' }}>
            {analytics?.summary?.highCount || 0}
          </div>
          <div className="stat-label">High Risk Incidents (60–79)</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--water-cyan)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--navy-50)', color: 'var(--navy-600)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-val">
            {analytics?.summary?.avgRiskScore || 67}/100
          </div>
          <div className="stat-label">Citywide Average Risk Score</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--navy-900)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--bg-secondary)', color: 'var(--navy-900)' }}>
            <Truck size={22} />
          </div>
          <div className="stat-val">
            {analytics?.summary?.activeDispatches || 0} Active
          </div>
          <div className="stat-label">Rapid Response Crews Deployed</div>
        </div>
      </div>

      {/* VISUAL ANALYTICS PANELS (Distribution + Zone Heatmap) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Risk Score Severity Distribution Spectrum */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-beige)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="var(--navy-900)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Risk Severity Tier Breakdown
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Total: {analytics?.summary?.total || 0} Incidents
            </span>
          </div>

          {/* Segmented Risk Bar Visualization */}
          <div style={{
            height: '24px',
            width: '100%',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: '1.25rem'
          }}>
            <div
              style={{
                width: `${((analytics?.summary?.criticalCount || 1) / (analytics?.summary?.total || 1)) * 100}%`,
                background: '#EF4444',
                transition: 'width 0.5s ease'
              }}
              title={`Critical: ${analytics?.summary?.criticalCount}`}
            ></div>
            <div
              style={{
                width: `${((analytics?.summary?.highCount || 1) / (analytics?.summary?.total || 1)) * 100}%`,
                background: '#F59E0B',
                transition: 'width 0.5s ease'
              }}
              title={`High: ${analytics?.summary?.highCount}`}
            ></div>
            <div
              style={{
                width: `${((analytics?.summary?.mediumCount || 1) / (analytics?.summary?.total || 1)) * 100}%`,
                background: '#3B82F6',
                transition: 'width 0.5s ease'
              }}
              title={`Medium: ${analytics?.summary?.mediumCount}`}
            ></div>
            <div
              style={{
                width: `${((analytics?.summary?.lowCount || 1) / (analytics?.summary?.total || 1)) * 100}%`,
                background: '#10B981',
                transition: 'width 0.5s ease'
              }}
              title={`Low: ${analytics?.summary?.lowCount}`}
            ></div>
          </div>

          {/* Legend Items with Percentages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#FEE2E2', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#991B1B' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                Critical Hazard (80-100)
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#991B1B' }}>{analytics?.summary?.criticalCount || 0}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#FEF3C7', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                High Priority (60-79)
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#92400E' }}>{analytics?.summary?.highCount || 0}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#DBEAFE', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
                Moderate Risk (40-59)
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#1E40AF' }}>{analytics?.summary?.mediumCount || 0}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#DCFCE7', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                Low Concern (0-39)
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#166534' }}>{analytics?.summary?.lowCount || 0}</strong>
            </div>
          </div>
        </div>

        {/* Zone Criticality Vulnerability Heatmap */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-beige)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--navy-900)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Urban Zone Vulnerability Index
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Risk Intensity</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(analytics?.zoneDistribution || []).map((z, idx) => {
              const riskMeta = getRiskColor(z.avg_risk);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '140px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {z.zone}
                  </div>
                  <div style={{ flex: 1, height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${z.avg_risk}%`,
                        height: '100%',
                        background: riskMeta.border,
                        borderRadius: '5px',
                        transition: 'width 0.4s ease'
                      }}
                    ></div>
                  </div>
                  <div style={{ width: '65px', textAlign: 'right', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: riskMeta.text }}>
                    {z.avg_risk}/100
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & RANKED LIST */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {/* Filters Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-beige)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', marginRight: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} /> Filter:
            </span>
            {['All', 'Critical', 'High', 'Medium', 'Low', 'Active', 'Resolved'].map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: activeFilter === pill ? 'var(--navy-900)' : 'var(--border-beige)',
                  background: activeFilter === pill ? 'var(--navy-900)' : 'var(--bg-primary)',
                  color: activeFilter === pill ? '#FFFFFF' : 'var(--navy-800)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="input-container" style={{ width: '220px' }}>
              <span className="input-icon"><Search size={14} /></span>
              <input
                type="text"
                className="input-field"
                placeholder="Search location or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.45rem 0.75rem 0.45rem 2.2rem', fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-beige)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--navy-900)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="risk_score">Highest Risk First (#1 Rank)</option>
                <option value="water_level_pct">Highest Water Level</option>
                <option value="sla_hours_remaining">Urgent SLA Remaining</option>
                <option value="created_at">Latest Lodged</option>
              </select>
            </div>
          </div>
        </div>

        {/* RANKED COMPLAINTS LIST TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Incident & Category</th>
                <th>Vulnerable Location</th>
                <th>Water Depth</th>
                <th>Risk Score & Gauge</th>
                <th>SLA Timer</th>
                <th>Status & Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No complaints matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((item, index) => {
                  const riskMeta = getRiskColor(item.risk_score);
                  const isTopRanked = index < 3 && activeFilter === 'All';

                  return (
                    <tr key={item.id} style={{ background: isTopRanked ? 'rgba(254, 226, 226, 0.2)' : 'transparent' }}>
                      {/* Priority Rank Badge */}
                      <td>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: index === 0 ? '#DC2626' : index === 1 ? '#EA580C' : index === 2 ? '#D97706' : 'var(--bg-secondary)',
                          color: index < 3 ? '#FFFFFF' : 'var(--navy-900)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          fontFamily: 'var(--font-mono)',
                          boxShadow: index < 3 ? '0 2px 8px rgba(220,38,38,0.25)' : 'none'
                        }}>
                          #{index + 1}
                        </div>
                      </td>

                      {/* Title & Category */}
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--water-cyan)' }}>
                              {item.complaint_id}
                            </span>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              background: 'var(--bg-secondary)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              color: 'var(--navy-800)'
                            }}>
                              {item.category}
                            </span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Reported by: {item.reported_by} ({item.contact_phone || 'Protected'})
                          </div>
                        </div>
                      </td>

                      {/* Location & Zone */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                          <MapPin size={15} color="var(--navy-900)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                              {item.location}
                            </div>
                            <span style={{
                              display: 'inline-block',
                              marginTop: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: 'var(--navy-700)',
                              background: 'var(--bg-tertiary)',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '4px'
                            }}>
                              {item.zone_criticality}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Water Level */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <div style={{ width: '70px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${item.water_level_pct}%`,
                                height: '100%',
                                background: item.water_level_pct > 80 ? '#EF4444' : item.water_level_pct > 60 ? '#F59E0B' : 'var(--water-cyan)'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem' }}>
                            {item.water_level_pct}%
                          </span>
                        </div>
                      </td>

                      {/* Risk Score & Gauge */}
                      <td>
                        <div style={{
                          display: 'inline-flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              background: riskMeta.bg,
                              border: `1px solid ${riskMeta.border}`,
                              color: riskMeta.text,
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.88rem',
                              fontWeight: 800
                            }}>
                              {item.risk_score} / 100
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: riskMeta.text }}>
                              {riskMeta.label}
                            </span>
                          </div>
                          {/* Mini Risk Gauge Bar */}
                          <div style={{ width: '100%', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${item.risk_score}%`,
                                height: '100%',
                                background: riskMeta.border
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* SLA Timer */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                          <Clock size={14} color={item.sla_hours_remaining <= 4 ? '#EF4444' : 'var(--text-muted)'} />
                          <span style={{ fontWeight: item.sla_hours_remaining <= 4 ? 700 : 500, color: item.sla_hours_remaining <= 4 ? '#DC2626' : 'var(--navy-900)' }}>
                            {item.sla_hours_remaining > 0 ? `${item.sla_hours_remaining} hrs left` : 'Resolved'}
                          </span>
                        </div>
                      </td>

                      {/* Status & Actions */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <span className={`badge-pill ${item.status.includes('Critical') ? 'badge-critical' : item.status === 'Resolved' ? 'badge-normal' : 'badge-warning'}`}>
                            {item.status}
                          </span>

                          {item.status !== 'Resolved' ? (
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                              {item.status !== 'Critical Dispatch' && (
                                <button
                                  onClick={() => handleStatusChange(item.id, 'Critical Dispatch')}
                                  disabled={actionLoading === item.id}
                                  style={{
                                    padding: '0.2rem 0.5rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    background: '#DC2626',
                                    color: '#FFF',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Dispatch
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusChange(item.id, 'Resolved')}
                                disabled={actionLoading === item.id}
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  background: '#059669',
                                  color: '#FFF',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Resolve
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--success-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <CheckCircle2 size={12} /> Closed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LODGE NEW COMPLAINT MODAL WITH LIVE RISK PREDICTOR */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 25, 47, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-beige)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Lodge Infrastructure Incident
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submit report with real-time automated risk evaluation.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {submitMsg && (
              <div className="alert-banner success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={16} />
                <span>{submitMsg}</span>
              </div>
            )}

            {/* LIVE RISK PREDICTOR BANNER */}
            <div style={{
              background: getRiskColor(previewRiskScore).bg,
              border: `1.5px solid ${getRiskColor(previewRiskScore).border}`,
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: getRiskColor(previewRiskScore).text }}>
                  Dynamic AI Risk Assessment Preview
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--navy-900)', marginTop: '0.2rem' }}>
                  Classification: <strong>{getRiskColor(previewRiskScore).label}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: getRiskColor(previewRiskScore).text }}>
                  {previewRiskScore}/100
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Estimated Score</div>
              </div>
            </div>

            <form onSubmit={handleCreateComplaint}>
              <div className="form-group">
                <label className="form-label">Incident Title / Hazard Summary</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="e.g. Sump backflow flooding hospital access gate"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Hazard Category</label>
                  <select
                    className="input-field"
                    style={{ paddingLeft: '0.75rem' }}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Culvert Collapse">Culvert Collapse (Critical)</option>
                    <option value="Toxic Sludge & Overflow">Toxic Sludge & Chemical Runoff</option>
                    <option value="Sump Overflow">Sump / Basin Overflow</option>
                    <option value="Severe Blockage">Severe Blockage (Silt/Plastics)</option>
                    <option value="Open Manhole Hazard">Open Manhole Hazard</option>
                    <option value="Siltation">Slow Drainage Siltation</option>
                    <option value="Trash Grate Clog">Surface Trash Grate Clog</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Urban Zone Criticality</label>
                  <select
                    className="input-field"
                    style={{ paddingLeft: '0.75rem' }}
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                  >
                    <option value="Critical Health Zone">Critical Health Zone (Hospital)</option>
                    <option value="High Traffic Transit">High Traffic Transit / Metro</option>
                    <option value="School Safety Zone">School Safety Zone</option>
                    <option value="Dense Commercial">Dense Commercial District</option>
                    <option value="Residential">Residential Community</option>
                    <option value="Public Park">Public Park / Greenery</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Landmark Address</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="e.g. North Arterial Canal Siphon #7, Sector 5"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label">
                  <span>Water Depth / Inundation Level</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{newWaterLevel}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={newWaterLevel}
                  onChange={(e) => setNewWaterLevel(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--navy-900)', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Field Description & Observations</label>
                <textarea
                  className="input-field"
                  style={{ paddingLeft: '1rem', minHeight: '70px' }}
                  placeholder="Provide additional details on water flow, vehicle obstruction, or structural cracks..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  style={{ margin: 0 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Evaluating & Lodging...' : 'Submit & Compute Priority Rank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
