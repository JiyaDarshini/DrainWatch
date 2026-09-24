import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Smartphone, 
  LogOut, 
  Activity, 
  Waves, 
  AlertTriangle, 
  Database, 
  Radio, 
  RefreshCw,
  Building,
  CheckCircle,
  MapPin,
  Clock,
  PlusCircle,
  User,
  Sliders,
  Sparkles,
  Camera,
  HardHat
} from 'lucide-react';
import RiskComplaintsVisualizer from './RiskComplaintsVisualizer';
import CitizenDashboard from './CitizenDashboard';
import CitizenComplaintModal from './CitizenComplaintModal';
import FieldInspectorDashboard from './FieldInspectorDashboard';

export default function Dashboard({ user, onLogout }) {
  // Default view based on role
  const isInspector = user?.role === 'Field Inspector';
  const isCitizen = user?.role === 'Citizen';
  const [activeTab, setActiveTab] = useState(
    isCitizen ? 'citizen' : isInspector ? 'inspector' : 'official'
  );
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [telemetryRes, healthRes] = await Promise.all([
        fetch('/api/telemetry'),
        fetch('/api/system/health')
      ]);

      if (telemetryRes.ok) {
        const tData = await telemetryRes.json();
        setTelemetry(tData.alerts || []);
      }

      if (healthRes.ok) {
        const hData = await healthRes.json();
        setSystemStats(hData);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Top Banner Hero */}
      <div className="dashboard-hero">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Welcome, {user?.fullName || 'Infrastructure Officer'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: '600px' }}>
            DrainWatch Social Infrastructure & Urban Drainage Surveillance Grid. Real-time civic hazard logging & telemetry network.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          {/* Quick Register Complaint CTA */}
          <button
            onClick={() => setIsComplaintModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Camera size={16} /> Register Complaint
          </button>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{user?.role || 'Citizen'}</div>
            <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{user?.email}</div>
          </div>
          <button
            onClick={onLogout}
            className="btn-secondary-outline"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.25)',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* User Profile & Verification Status Banner */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.75rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--bg-secondary)',
            color: 'var(--navy-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-beige)'
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>{user?.fullName}</h3>
              <span className="brand-badge">{user?.role}</span>
              {user?.isPhoneVerified && (
                <span className="badge-pill badge-normal">
                  <ShieldCheck size={12} /> Verified Phone
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.25rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
              <span><strong>Phone:</strong> {user?.phone}</span>
              <span><strong>Email:</strong> {user?.email}</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-beige)',
            display: 'flex',
            gap: '0.25rem',
            flexWrap: 'wrap'
          }}>
            {/* Field Inspector Station Tab */}
            {(user?.role === 'Field Inspector' || user?.role === 'Municipal Officer' || user?.role === 'Drainage Engineer') && (
              <button
                onClick={() => setActiveTab('inspector')}
                style={{
                  background: activeTab === 'inspector' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'inspector' ? 'var(--navy-900)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: activeTab === 'inspector' ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'inspector' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s'
                }}
              >
                <HardHat size={14} color="#D97706" />
                <span>Field Inspector Station</span>
              </button>
            )}

            {/* Municipal Grid Tab */}
            {user?.role !== 'Citizen' && user?.role !== 'Field Inspector' && (
              <button
                onClick={() => setActiveTab('official')}
                style={{
                  background: activeTab === 'official' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'official' ? 'var(--navy-900)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: activeTab === 'official' ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'official' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s'
                }}
              >
                <Activity size={14} color="var(--water-cyan)" />
                <span>Municipal Grid & Triage</span>
              </button>
            )}

            {/* Citizen View Tab */}
            <button
              onClick={() => setActiveTab('citizen')}
              style={{
                background: activeTab === 'citizen' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'citizen' ? 'var(--navy-900)' : 'var(--text-muted)',
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'citizen' ? 700 : 500,
                cursor: 'pointer',
                boxShadow: activeTab === 'citizen' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s'
              }}
            >
              <Sparkles size={14} color="var(--water-cyan)" />
              <span>Citizen View</span>
            </button>
          </div>

          <button
            onClick={fetchDashboardData}
            className="btn-secondary-outline"
            style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO ACTIVE TAB */}
      {activeTab === 'citizen' ? (
        <CitizenDashboard user={user} />
      ) : activeTab === 'inspector' ? (
        <FieldInspectorDashboard user={user} />
      ) : (
        <>
          {/* Telemetry Sensor Table */}
          <div className="data-table-card">
            <div className="table-header">
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Live Waterway & Sump Telemetry
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Real-time monitoring telemetry. Last sync: {lastRefreshed.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Location & Basin</th>
                    <th>Water Depth</th>
                    <th>Flow Velocity</th>
                    <th>Status</th>
                    <th>Telemetry Node</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetry.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="var(--water-cyan)" />
                        {item.location}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '80px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${item.water_level_pct}%`,
                                height: '100%',
                                background: item.water_level_pct > 80 ? 'var(--danger-crimson)' : item.water_level_pct > 60 ? 'var(--warning-amber)' : 'var(--water-cyan)'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.water_level_pct}%</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{item.flow_rate_m3s || '5.4'} m³/s</td>
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

          {/* Municipal Risk Ranking & Complaints Visualization System */}
          <RiskComplaintsVisualizer user={user} />
        </>
      )}

      {/* Global Citizen Complaint Modal Trigger */}
      <CitizenComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
        user={user}
      />
    </div>
  );
}
