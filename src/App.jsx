import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import DrainWatchLogo from './components/DrainWatchLogo';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('drainwatch_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('drainwatch_token') || null);

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
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('drainwatch_user', JSON.stringify(data.user));
          }
        } else {
          // If server token is expired and no valid local user session
          if (!localStorage.getItem('drainwatch_user')) {
            localStorage.removeItem('drainwatch_token');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
      }
    }
    checkSession();
  }, [token]);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('drainwatch_user', JSON.stringify(userData));
    }
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('drainwatch_token', userToken);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('drainwatch_token');
    localStorage.removeItem('drainwatch_user');
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
