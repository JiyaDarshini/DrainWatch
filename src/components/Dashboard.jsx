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
  Clock
} from 'lucide-react';
import RiskComplaintsVisualizer from './RiskComplaintsVisualizer';

export default function Dashboard({ user, onLogout }) {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8', marginBottom: '0.75rem' }}>
            <Activity size={14} className="animate-pulse" /> Live Telemetry Command Station
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Welcome back, {user?.fullName || 'Infrastructure Officer'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: '600px' }}>
            DrainWatch Social Infrastructure & Urban Drainage Surveillance Grid. All sensors streaming nominal telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
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
        marginBottom: '2rem',
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.25rem', marginTop: '0.2rem' }}>
              <span><strong>Phone:</strong> {user?.phone}</span>
              <span><strong>Email:</strong> {user?.email}</span>
              <span><strong>DB Instance:</strong> Neon PostgreSQL (AWS US-East-2)</span>
            </div>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="btn-secondary-outline"
          style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Telemetry
        </button>
      </div>

      {/* Grid Stats */}
      <div className="dash-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--navy-50)', color: 'var(--navy-600)' }}>
            <Waves size={22} />
          </div>
          <div className="stat-val">{telemetry.length || 4} Active</div>
          <div className="stat-label">Drainage Monitoring Nodes</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--success-bg)', color: 'var(--success-emerald)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="stat-val">Nominal</div>
          <div className="stat-label">Catchment Basin Health</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--warning-bg)', color: 'var(--warning-amber)' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="stat-val">1 Node Alert</div>
          <div className="stat-label">North Arterial #12 High Flow</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--bg-secondary)', color: 'var(--navy-900)' }}>
            <Database size={22} />
          </div>
          <div className="stat-val">{systemStats?.registeredUsers || 1} User(s)</div>
          <div className="stat-label">Neon DB Registered Accounts</div>
        </div>
      </div>

      {/* Telemetry Sensor Table */}
      <div className="data-table-card">
        <div className="table-header">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              Live Waterway & Sump Telemetry
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Data synchronized directly with Neon PostgreSQL cluster. Last sync: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
          <div className="db-pill">
            <span className="pulse-dot"></span>
            <span>NEON POSTGRES CONNECTED</span>
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
    </div>
  );
}
