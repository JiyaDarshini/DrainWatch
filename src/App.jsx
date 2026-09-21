import React, { useState, useEffect } from 'react';
import { Waves, Shield, Database, Radio, CheckCircle, Smartphone } from 'lucide-react';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

import DrainWatchLogo from './components/DrainWatchLogo';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('drainwatch_token') || null);
  const [dbStatus, setDbStatus] = useState({ connected: false, checking: true });

  // Verify stored session token on initial mount
  useEffect(() => {
    async function checkSession() {
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem('drainwatch_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session verification error:', err);
      }
    }
    checkSession();
  }, [token]);

  // Check Neon DB Health
  useEffect(() => {
    async function checkDbHealth() {
      try {
        const res = await fetch('/api/system/health');
        if (res.ok) {
          const data = await res.json();
          setDbStatus({ connected: data.dbConnected, checking: false });
        } else {
          setDbStatus({ connected: false, checking: false });
        }
      } catch (err) {
        setDbStatus({ connected: false, checking: false });
      }
    }
    checkDbHealth();
  }, []);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('drainwatch_token', userToken);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('drainwatch_token');
    setToken(null);
    setUser(null);
  };

  return (
    <div className="min-h-screen">
      {/* Top Header Navigation */}
      <header className="top-navbar">
        <div className="brand-logo">
          <div className="logo-badge">
            <DrainWatchLogo size={36} color="#0A192F" />
          </div>
          <div className="brand-name">
            Drain<span>Watch</span>
          </div>
          <span className="brand-badge">Smart Social Infrastructure</span>
        </div>

        <div className="nav-status">
          <div className="db-pill">
            <span className={`pulse-dot ${dbStatus.connected ? '' : 'offline'}`} style={{ backgroundColor: dbStatus.connected ? '#10B981' : '#F59E0B' }}></span>
            <span>{dbStatus.connected ? 'Neon Cloud Connected' : 'Telemetry Grid Ready'}</span>
          </div>
        </div>
      </header>

      {/* Main View: Dashboard or Login/Signup */}
      <main>
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <AuthModal onAuthSuccess={handleAuthSuccess} />
        )}
      </main>
    </div>
  );
}
