import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  MapPin, 
  Layers, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Activity, 
  Wrench, 
  DollarSign, 
  ShieldAlert, 
  FileText, 
  Cpu, 
  RefreshCw, 
  Eye, 
  Search, 
  Filter, 
  ArrowUpRight, 
  TrendingUp, 
  Zap, 
  HardHat, 
  Building, 
  Sparkles, 
  Droplets, 
  X, 
  Send,
  AlertCircle,
  BarChart2,
  Check
} from 'lucide-react';
import ComplaintDetailModal from './ComplaintDetailModal';

// Mock Infrastructure Network GIS Hotspot Nodes
const INFRASTRUCTURE_NODES = [
  { id: 'NODE-C4', name: 'Central Trunk Culvert #4', zone: 'Central Basin', pipeSize: '1200mm RCP', capacityUtil: 88, status: 'Overloaded', risk: 'High', lat: 13.0827, lng: 80.2707 },
  { id: 'NODE-N12', name: 'North Canal Outfall Siphon', zone: 'North Canal', pipeSize: '1500mm Box', capacityUtil: 94, status: 'Critical Surge', risk: 'Critical', lat: 13.1100, lng: 80.2800 },
  { id: 'NODE-IND3', name: 'Industrial Sump Pump Station #3', zone: 'Industrial Outfall', pipeSize: '900mm HDPE', capacityUtil: 62, status: 'Operational', risk: 'Moderate', lat: 13.0400, lng: 80.2100 },
  { id: 'NODE-M15', name: 'Metro Corridor Sub-surface Drain', zone: 'Metro Transit', pipeSize: '1000mm RCP', capacityUtil: 75, status: 'Moderate Load', risk: 'Moderate', lat: 13.0780, lng: 80.2650 },
];

export default function DrainageEngineerDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Technical Assessment Modal State
  const [assessmentModalComplaint, setAssessmentModalComplaint] = useState(null);
  const [technicalCause, setTechnicalCause] = useState('Undersized Pipe / Hydraulic Bottleneck');
  const [recommendedFix, setRecommendedFix] = useState('Pipe Diameter Upgrade & Redesign');
  const [estimatedCost, setEstimatedCost] = useState('75000');
  const [requiredMachinery, setRequiredMachinery] = useState('High-Pressure Jetting Vacuum Unit, Hydraulic Shoring Rig');
  const [materialSpecs, setMaterialSpecs] = useState('1200mm NP3 Concrete Hume Pipes, Polyurethane Sealant');
  const [estimatedDuration, setEstimatedDuration] = useState('48 Hours');
  const [isStructuralRisk, setIsStructuralRisk] = useState(true);
  const [structuralRiskLevel, setStructuralRiskLevel] = useState('Critical Structural Vulnerability');
  const [engineerNotes, setEngineerNotes] = useState('');
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  // Fetch complaints & telemetry
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('drainwatch_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [compRes, teleRes] = await Promise.all([
        fetch('/api/complaints?sortBy=risk_score', { headers }),
        fetch('/api/telemetry', { headers })
      ]);

      if (compRes.ok) {
        const cData = await compRes.json();
        setComplaints(cData.complaints || []);
      }

      if (teleRes.ok) {
        const tData = await teleRes.json();
        setTelemetry(tData.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching drainage engineer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filter technical cases (Structural damage, culvert collapse, severe blockages, siltation, capacity issues)
  const technicalCases = complaints.filter(c => {
    const isTechCategory = [
      'Culvert Collapse', 
      'Severe Blockage', 
      'Sump Overflow', 
      'Toxic Sludge & Overflow', 
      'Siltation', 
      'Open Manhole Hazard'
    ].includes(c.category) || c.risk_score >= 50 || c.is_escalated;

    const matchesFilter = filterCategory === 'All' 
      ? true 
      : filterCategory === 'Structural' 
      ? (c.category === 'Culvert Collapse' || c.is_structural_risk)
      : filterCategory === 'Assessed'
      ? (c.technical_cause || c.status === 'Technical Recommendation Submitted')
      : filterCategory === 'Pending'
      ? (!c.technical_cause && c.status !== 'Technical Recommendation Submitted')
      : c.category?.toLowerCase().includes(filterCategory.toLowerCase());

    const matchesSearch = !searchQuery || 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complaint_id?.toLowerCase().includes(searchQuery.toLowerCase());

    return isTechCategory && matchesFilter && matchesSearch;
  });

  // Calculate stats
  const totalAssessedBudget = complaints.reduce((sum, c) => sum + (parseInt(c.estimated_cost, 10) || 0), 0);
  const structuralRiskCount = complaints.filter(c => c.is_structural_risk || c.category === 'Culvert Collapse').length;
  const pendingAssessmentCount = technicalCases.filter(c => !c.technical_cause).length;

  // Open Assessment Modal and prefill existing data if any
  const handleOpenAssessmentModal = (complaint) => {
    setAssessmentModalComplaint(complaint);
    setTechnicalCause(complaint.technical_cause || 'Undersized Pipe / Hydraulic Bottleneck');
    setRecommendedFix(complaint.recommended_fix || 'Pipe Diameter Upgrade & Redesign');
    setEstimatedCost(complaint.estimated_cost ? String(complaint.estimated_cost) : '65000');
    setRequiredMachinery(complaint.required_machinery || 'High-Pressure Hydro-Jetting Rig, Heavy Silt Vacuum Unit');
    setMaterialSpecs(complaint.material_specs || '1200mm Reinforced Concrete Pipes, Rapid Set Hydraulic Grout');
    setEstimatedDuration(complaint.estimated_duration || '48 Hours');
    setIsStructuralRisk(complaint.is_structural_risk !== undefined ? Boolean(complaint.is_structural_risk) : true);
    setStructuralRiskLevel(complaint.structural_risk_level || 'High Structural Risk');
    setEngineerNotes(complaint.engineer_notes || `Evaluated hydraulic capacity and structural integrity for ${complaint.location}. Flow constricted under peak monsoon load.`);
    setSubmitSuccessMsg('');
  };

  // Submit Engineer Assessment
  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentModalComplaint) return;

    setIsSubmittingAssessment(true);
    setSubmitSuccessMsg('');
    try {
      const token = localStorage.getItem('drainwatch_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const res = await fetch(`/api/complaints/${assessmentModalComplaint.id || assessmentModalComplaint.complaint_id}/engineer-assessment`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          technicalCause,
          recommendedFix,
          estimatedCost: parseInt(estimatedCost, 10) || 0,
          requiredMachinery,
          materialSpecs,
          estimatedDuration,
          isStructuralRisk,
          structuralRiskLevel: isStructuralRisk ? structuralRiskLevel : 'None',
          engineerNotes,
          assessedBy: user?.fullName || 'Senior Drainage Engineer',
        })
      });

      if (res.ok) {
        setSubmitSuccessMsg('Technical Recommendation submitted upward to Municipal Authority for Budget Approval!');
        setTimeout(() => {
          setAssessmentModalComplaint(null);
          loadData();
        }, 1200);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit technical recommendation');
      }
    } catch (err) {
      console.error('Error submitting technical assessment:', err);
      alert('Error submitting technical assessment. Check network connection.');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  return (
    <div className="engineer-dashboard-view">
      {/* Scope & Responsibility Notice Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(15, 23, 42, 0.03) 100%)',
        border: '1px solid rgba(13, 148, 136, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: '#0D9488',
            color: '#FFFFFF',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              Hydraulic Infrastructure Surveillance & Engineering Gateway
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Technical cause assessment, pipe diameter sizing, structural risk GIS tagging & repair budget estimation for Municipal Authority authorization.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge-pill" style={{ background: 'rgba(13, 148, 136, 0.15)', color: '#0F766E', fontWeight: 700 }}>
            <Zap size={12} /> Engineering Mode Active
          </span>
          <button 
            onClick={loadData}
            className="btn-secondary-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Engineering KPI Metrics Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#D97706' }}>
            <Wrench size={22} />
          </div>
          <div>
            <div className="stat-value">{technicalCases.length}</div>
            <div className="stat-label">Technical Case Queue</div>
            <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '0.2rem', fontWeight: 600 }}>
              {pendingAssessmentCount} Pending Assessment
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="stat-value">{structuralRiskCount}</div>
            <div className="stat-label">Structural Risk Hotspots</div>
            <div style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: '0.2rem', fontWeight: 600 }}>
              Flagged for AI & GIS Model
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="stat-value">₹{totalAssessedBudget.toLocaleString('en-IN')}</div>
            <div className="stat-label">Estimated Budget Pipeline</div>
            <div style={{ fontSize: '0.72rem', color: '#2563EB', marginTop: '0.2rem', fontWeight: 600 }}>
              Submitted for Municipal Approval
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(13, 148, 136, 0.12)', color: '#0D9488' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-value">{telemetry.length} Nodes</div>
            <div className="stat-label">Hydraulic Telemetry Grid</div>
            <div style={{ fontSize: '0.72rem', color: '#0D9488', marginTop: '0.2rem', fontWeight: 600 }}>
              Live Sump & Outfall Sonar
            </div>
          </div>
        </div>
      </div>

      {/* Hydraulic Telemetry & Sump Node Sensor Stream */}
      <div className="data-table-card" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              Live Hydraulic Sensor Network & Sump Telemetry
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time volumetric flow velocity (m³/s), water depth %, and sump station load.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Telemetry Node & Location</th>
                <th>Hydraulic Water Level</th>
                <th>Flow Velocity</th>
                <th>Telemetry Status</th>
                <th>Sensor Hardware</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="#0D9488" />
                    {item.location}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '90px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${item.water_level_pct}%`,
                            height: '100%',
                            background: item.water_level_pct > 80 ? 'var(--danger-crimson)' : item.water_level_pct > 60 ? 'var(--warning-amber)' : '#0D9488'
                          }}
                        ></div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.water_level_pct}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.flow_rate_m3s || '6.4'} m³/s</td>
                  <td>
                    <span className={`badge-pill ${item.status.includes('Critical') ? 'badge-critical' : item.status.includes('Moderate') ? 'badge-warning' : 'badge-normal'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.reported_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infrastructure GIS Network Layer & Hydraulic Hotspots */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#0D9488" />
              Drainage Infrastructure & Trunk Pipe GIS Network
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Primary culvert dimensions, outfall capacities, and hydraulic bottleneck hotspots.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#0D9488', background: 'rgba(13, 148, 136, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
            GIS Layer v3.2 Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {INFRASTRUCTURE_NODES.map((node) => {
            const isCritical = node.risk === 'Critical';
            const isHigh = node.risk === 'High';
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isCritical ? '1px solid #EF4444' : isHigh ? '1px solid #F59E0B' : '1px solid var(--border-beige)',
                  background: isCritical ? 'rgba(239, 68, 68, 0.04)' : isHigh ? 'rgba(245, 158, 11, 0.03)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>{node.id}</span>
                  <span className={`badge-pill ${isCritical ? 'badge-critical' : isHigh ? 'badge-warning' : 'badge-normal'}`}>
                    {node.risk} Risk
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                  {node.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  {node.zone} • <strong>{node.pipeSize}</strong>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Capacity Load:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{node.capacityUtil}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${node.capacityUtil}%`, height: '100%', background: isCritical ? '#EF4444' : isHigh ? '#F59E0B' : '#0D9488' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Cases Queue Header & Filters */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={20} color="#0D9488" />
              Technical Case Queue & Infrastructure Assessments
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Complaints routed after field inspector verification. Diagnose root cause, specify fix, estimate repair budget & tag structural risks.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search incident, location, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-beige)',
                  fontSize: '0.82rem',
                  width: '100%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { id: 'All', label: 'All Technical Incidents' },
            { id: 'Pending', label: 'Pending Assessment' },
            { id: 'Assessed', label: 'Assessed (Awaiting Approval)' },
            { id: 'Structural', label: 'Structural / Culvert Risks' },
            { id: 'Sump', label: 'Sump / Pumping Issues' },
            { id: 'Blockage', label: 'Severe Blockages' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              style={{
                background: filterCategory === f.id ? '#0D9488' : 'var(--bg-secondary)',
                color: filterCategory === f.id ? '#FFFFFF' : 'var(--navy-900)',
                border: '1px solid var(--border-beige)',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Technical Incident Cards List */}
        {technicalCases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} color="#0D9488" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ color: 'var(--navy-900)', fontSize: '1.1rem', fontWeight: 700 }}>No Outstanding Technical Incidents</h4>
            <p style={{ fontSize: '0.85rem' }}>All verified drainage cases have been evaluated or no matching incidents found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {technicalCases.map((complaint) => {
              const isAssessed = Boolean(complaint.technical_cause || complaint.status === 'Technical Recommendation Submitted');
              const hasStructuralRisk = complaint.is_structural_risk || complaint.category === 'Culvert Collapse';

              return (
                <div
                  key={complaint.id || complaint.complaint_id}
                  style={{
                    border: hasStructuralRisk ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-beige)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem',
                    background: hasStructuralRisk ? 'rgba(239, 68, 68, 0.02)' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0D9488' }}>
                          {complaint.complaint_id}
                        </span>
                        <span className="brand-badge" style={{ fontSize: '0.7rem' }}>
                          {complaint.category}
                        </span>
                        <span className={`badge-pill ${complaint.risk_score >= 80 ? 'badge-critical' : complaint.risk_score >= 60 ? 'badge-warning' : 'badge-normal'}`}>
                          Risk Score: {complaint.risk_score}/100
                        </span>
                        {hasStructuralRisk && (
                          <span className="badge-pill badge-critical">
                            <ShieldAlert size={12} /> Structural Risk GIS Tag
                          </span>
                        )}
                        {complaint.is_escalated && (
                          <span className="badge-pill badge-warning">
                            Escalated by Field Inspector
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.3rem' }}>
                        {complaint.title}
                      </h4>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} color="var(--water-cyan)" /> {complaint.location}
                        </span>
                        <span>• Zone: <strong>{complaint.zone_criticality || 'Residential'}</strong></span>
                        <span>• Water Depth: <strong>{complaint.water_level_pct}%</strong></span>
                        {complaint.inspected_by && (
                          <span style={{ color: '#D97706', fontWeight: 600 }}>
                            • Inspected by: {complaint.inspected_by}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="btn-secondary-outline"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                        title="View Full Incident File"
                      >
                        <Eye size={13} /> View File
                      </button>
                      
                      <button
                        onClick={() => handleOpenAssessmentModal(complaint)}
                        style={{
                          background: isAssessed ? '#0F766E' : 'linear-gradient(135deg, #0D9488 0%, #047857 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.45rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)'
                        }}
                      >
                        <Wrench size={13} />
                        {isAssessed ? 'Edit Recommendation' : 'Assess & Recommend Fix'}
                      </button>
                    </div>
                  </div>

                  {/* Complaint Description & Field Inspector Report */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <div style={{ color: 'var(--navy-900)', marginBottom: complaint.field_notes ? '0.4rem' : '0' }}>
                      <strong>Citizen Report:</strong> {complaint.description || 'No description provided.'}
                    </div>
                    {complaint.field_notes && (
                      <div style={{ color: '#92400E', background: 'rgba(245, 158, 11, 0.12)', padding: '0.4rem 0.6rem', borderRadius: '4px', marginTop: '0.35rem' }}>
                        <strong>Field Inspector Notes:</strong> {complaint.field_notes}
                      </div>
                    )}
                  </div>

                  {/* Existing Engineer Technical Recommendation Details (If Assessed) */}
                  {isAssessed && (
                    <div style={{
                      background: 'rgba(13, 148, 136, 0.06)',
                      border: '1px solid rgba(13, 148, 136, 0.2)',
                      borderRadius: '6px',
                      padding: '0.85rem 1rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.75rem',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Diagnosed Root Cause:</span>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{complaint.technical_cause}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Recommended Technical Fix:</span>
                        <div style={{ fontWeight: 700, color: '#0F766E' }}>{complaint.recommended_fix}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Estimated Budget (₹):</span>
                        <div style={{ fontWeight: 700, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                          ₹{(parseInt(complaint.estimated_cost, 10) || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Workflow Status:</span>
                        <div style={{ fontWeight: 700, color: '#D97706' }}>
                          Awaiting Municipal Budget Approval
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TECHNICAL ASSESSMENT & REPAIR RECOMMENDATION MODAL */}
      {assessmentModalComplaint && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 17, 32, 0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border-beige)',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid var(--border-beige)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #0A192F 0%, #0D2847 100%)',
              color: '#FFFFFF',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <Radio size={18} color="#38BDF8" />
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38BDF8', fontWeight: 700 }}>
                    {assessmentModalComplaint.complaint_id} • TECHNICAL SPECIFICATION
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Infrastructure Assessment & Fix Recommendation
                </h3>
              </div>
              <button
                onClick={() => setAssessmentModalComplaint(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitAssessment} style={{ padding: '1.75rem' }}>
              {/* Incident Summary Banner */}
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-beige)'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  {assessmentModalComplaint.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Location: <strong>{assessmentModalComplaint.location}</strong> • Zone: <strong>{assessmentModalComplaint.zone_criticality}</strong> • Risk Score: <strong>{assessmentModalComplaint.risk_score}/100</strong>
                </div>
              </div>

              {submitSuccessMsg && (
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #10B981',
                  color: '#065F46',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} /> {submitSuccessMsg}
                </div>
              )}

              {/* 1. Infrastructure-Level Root Cause */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  1. Infrastructure-Level Root Cause Diagnosis:
                </label>
                <select
                  className="form-input"
                  value={technicalCause}
                  onChange={(e) => setTechnicalCause(e.target.value)}
                  style={{ background: '#FFFFFF' }}
                >
                  <option value="Undersized Pipe / Hydraulic Bottleneck">Undersized Pipe / Hydraulic Bottleneck (Constricted Volume)</option>
                  <option value="Silt Accumulation & Heavy Sedimentation">Silt Accumulation & Heavy Sedimentation (&gt;50% canal choked)</option>
                  <option value="Structural Collapse / Concrete Culvert Wall Fracture">Structural Collapse / Concrete Culvert Wall Fracture</option>
                  <option value="Pump Station Mechanical / Electrical Inverter Trip">Pump Station Mechanical / Electrical Inverter Trip</option>
                  <option value="Inflow Exceeding Trunk Line Design Capacity">Inflow Exceeding Trunk Line Design Capacity (Extreme Weather)</option>
                  <option value="Trash Grate & Siphon Gate Obstruction">Trash Grate & Siphon Gate Obstruction (Solid Debris)</option>
                  <option value="Joint Displacement & Sub-surface Void Formation">Joint Displacement & Sub-surface Void Formation</option>
                </select>
              </div>

              {/* 2. Recommended Technical Fix */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  2. Recommended Technical Repair Solution:
                </label>
                <select
                  className="form-input"
                  value={recommendedFix}
                  onChange={(e) => setRecommendedFix(e.target.value)}
                  style={{ background: '#FFFFFF' }}
                >
                  <option value="High-Pressure Hydro Desilting & Vacuum Jetting">High-Pressure Hydro Desilting & Vacuum Jetting</option>
                  <option value="Concrete Culvert Reconstruction & Trench Shoring">Concrete Culvert Reconstruction & Trench Shoring</option>
                  <option value="Pipe Diameter Upgrade & Hydraulic Redesign (e.g. 900mm -> 1200mm)">Pipe Diameter Upgrade & Hydraulic Redesign (e.g. 900mm &rarr; 1200mm)</option>
                  <option value="Trenchless Cured-in-Place Pipe (CIPP) Structural Reline">Trenchless Cured-in-Place Pipe (CIPP) Structural Reline</option>
                  <option value="Dual Submersible Sump Pump & Auto-Switch Retrofit">Dual Submersible Sump Pump & Auto-Switch Retrofit</option>
                  <option value="Heavy-Duty Automated Trash Screen & Siphon Replacement">Heavy-Duty Automated Trash Screen & Siphon Replacement</option>
                </select>
              </div>

              {/* 3. Cost & Materials Estimation */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Estimated Repair Budget (INR ₹):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ paddingLeft: '1.8rem' }}
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="e.g. 75000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Estimated Repair Duration:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g. 48 Hours, 3 Days"
                    required
                  />
                </div>
              </div>

              {/* Machinery & Materials Specs */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Machinery & Equipment Required:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={requiredMachinery}
                  onChange={(e) => setRequiredMachinery(e.target.value)}
                  placeholder="e.g. Super-Sucker Suction Rig, 10-Ton Excavator, Trench Box"
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Material Specifications:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={materialSpecs}
                  onChange={(e) => setMaterialSpecs(e.target.value)}
                  placeholder="e.g. 1200mm NP3 RCC Hume Pipes, High-Early Polymer Cement"
                />
              </div>

              {/* 4. Structural Risk Tag for AI & GIS Model */}
              <div style={{
                background: isStructuralRisk ? 'rgba(239, 68, 68, 0.06)' : 'var(--bg-secondary)',
                border: isStructuralRisk ? '1px solid #EF4444' : '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isStructuralRisk ? '0.75rem' : '0' }}>
                  <label style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <ShieldAlert size={16} color={isStructuralRisk ? '#EF4444' : 'var(--text-muted)'} />
                    Mark as "Structural Risk" for AI Model / GIS Layer
                  </label>
                  <input
                    type="checkbox"
                    checked={isStructuralRisk}
                    onChange={(e) => setIsStructuralRisk(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                {isStructuralRisk && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Structural Risk Severity Level:</label>
                    <select
                      className="form-input"
                      value={structuralRiskLevel}
                      onChange={(e) => setStructuralRiskLevel(e.target.value)}
                      style={{ background: '#FFFFFF', fontSize: '0.82rem' }}
                    >
                      <option value="Critical Structural Vulnerability">Critical Structural Vulnerability (Immediate Civil Risk)</option>
                      <option value="Moderate Structural Degradation">Moderate Structural Degradation (Monsoon Warning)</option>
                      <option value="Hydraulic Under-Capacity Alert">Hydraulic Under-Capacity Alert (Redesign Candidate)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 5. Engineer Technical Remarks */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Detailed Technical Remarks & Justification:
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={engineerNotes}
                  onChange={(e) => setEngineerNotes(e.target.value)}
                  placeholder="State technical justification for the municipal budget allocation..."
                  required
                />
              </div>

              {/* Workflow Notice */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.04)',
                border: '1px solid #CBD5E1',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem'
              }}>
                <strong>Governance Rule:</strong> Submitting this form routes the technical repair recommendation upward to the Municipal Authority for budget sanction and contractor dispatch. Drainage Engineers do not directly alter citizen-facing resolution status.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setAssessmentModalComplaint(null)}
                  className="btn-secondary-outline"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssessment}
                  style={{
                    background: 'linear-gradient(135deg, #0D9488 0%, #047857 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.6rem 1.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                  }}
                >
                  <Send size={15} />
                  {isSubmittingAssessment ? 'Submitting...' : 'Submit Technical Recommendation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        userRole="Drainage Engineer"
      />
    </div>
  );
}
