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
import DrainageEngineerDashboard from './DrainageEngineerDashboard';

export default function Dashboard({ user, onLogout }) {
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

  // Role Configuration and Metadata
  const userRole = user?.role || 'Citizen';

  const roleMetadata = {
    'Citizen': {
      title: 'Citizen Portal & Community Surveillance',
      subtitle: 'Report neighborhood drainage blockages, track resolution progress with photo evidence, and view local hazard alerts.',
      badgeText: 'Citizen Portal Active',
      badgeClass: 'badge-normal',
      icon: UserCheck,
      iconColor: 'var(--water-cyan)'
    },
    'Field Inspector': {
      title: 'Field Inspector Command Station',
      subtitle: `Assigned Field Operations: ${user?.assigned_zone || 'Central Basin'}. On-site verification, resolution proof submission, and rapid response.`,
      badgeText: 'Field Inspector Active',
      badgeClass: 'badge-warning',
      icon: HardHat,
      iconColor: '#D97706'
    },
    'Municipal Officer': {
      title: 'Municipal Grid & Civic Triage Center',
      subtitle: 'Citywide civic hazard governance, automated AI risk ranking, SLA monitoring, and inter-departmental field dispatch.',
      badgeText: 'Municipal Officer Active',
      badgeClass: 'badge-normal',
      icon: Building,
      iconColor: '#2563EB'
    },
    'Drainage Engineer': {
      title: 'Drainage Engineering & Telemetry Station',
      subtitle: 'Real-time hydraulic telemetry surveillance, waterway flow depth, sump overflow sensors, and structural civil risk tracking.',
      badgeText: 'Drainage Engineer Active',
      badgeClass: 'badge-critical',
      icon: Radio,
      iconColor: '#0D9488'
    }
  };

  const currentRoleInfo = roleMetadata[userRole] || roleMetadata['Citizen'];
  const RoleIcon = currentRoleInfo.icon;

  return (
    <div className="dashboard-layout">
      {/* Top Banner Hero */}
      <div className="dashboard-hero">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Welcome, {user?.fullName || 'User'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: '650px' }}>
            {currentRoleInfo.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          {/* Quick Register Complaint CTA for all roles */}
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
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{userRole}</div>
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

      {/* User Profile & Role Verification Banner */}
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
            <RoleIcon size={24} color={currentRoleInfo.iconColor} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>{user?.fullName}</h3>
              <span className="brand-badge">{userRole}</span>
              {user?.isPhoneVerified && (
                <span className="badge-pill badge-normal">
                  <ShieldCheck size={12} /> Verified Phone
                </span>
              )}
              {user?.assigned_zone && (
                <span className="badge-pill badge-warning">
                  <MapPin size={12} /> {user?.assigned_zone}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.25rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
              <span><strong>Phone:</strong> {user?.phone || 'N/A'}</span>
              <span><strong>Email:</strong> {user?.email}</span>
            </div>
          </div>
        </div>

        {/* Role Active Status Indicator & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-beige)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--navy-900)'
          }}>
            <Activity size={14} color="var(--water-cyan)" />
            <span>{currentRoleInfo.title}</span>
          </div>

          <button
            onClick={fetchDashboardData}
            className="btn-secondary-outline"
            style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
            title="Refresh Live Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* STRICT ROLE-BASED DASHBOARD RENDERING */}
      {userRole === 'Citizen' && (
        <CitizenDashboard user={user} />
      )}

      {userRole === 'Field Inspector' && (
        <FieldInspectorDashboard user={user} />
      )}

      {userRole === 'Municipal Officer' && (
        <>
          {/* Municipal Live Telemetry Sensor Table */}
          <div className="data-table-card">
            <div className="table-header">
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Citywide Waterway & Sump Telemetry Network
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Real-time municipal telemetry monitoring. Last sync: {lastRefreshed.toLocaleTimeString()}
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

          {/* Municipal Risk Ranking & Complaints Triage */}
          <RiskComplaintsVisualizer user={user} />
        </>
      )}

      {userRole === 'Drainage Engineer' && (
        <DrainageEngineerDashboard user={user} />
      )}

      {/* Fallback for unrecognized role */}
      {!['Citizen', 'Field Inspector', 'Municipal Officer', 'Drainage Engineer'].includes(userRole) && (
        <CitizenDashboard user={user} />
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
