import React, { useState } from 'react';
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  Smartphone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Waves, 
  Activity, 
  Building2, 
  HardHat, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import OtpVerification from './OtpVerification';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function AuthModal({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerRole, setRegisterRole] = useState('Citizen');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // OTP Verification state
  const [verifyingPhone, setVerifyingPhone] = useState(null);
  const [devOtpPreview, setDevOtpPreview] = useState('');

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Strength Calculation
  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };
  const passwordStrength = calculateStrength(registerPassword);

  const roles = [
    { id: 'Citizen', label: 'Citizen', icon: User },
    { id: 'Field Inspector', label: 'Field Inspector', icon: HardHat },
    { id: 'Municipal Officer', label: 'Municipal Officer', icon: Building2 },
    { id: 'Drainage Engineer', label: 'Drainage Engineer', icon: Radio },
  ];

  // Reset helpers
  const resetRegisterFields = () => {
    setFullName('');
    setRegisterEmail('');
    setRegisterPhone('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setRegisterRole('Citizen');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const resetLoginFields = () => {
    setLoginIdentifier('');
    setLoginPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setErrorMsg('Please enter your email/phone and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      setSuccessMsg(data.message || 'Login successful!');
      if (data.token) {
        localStorage.setItem('drainwatch_token', data.token);
      }
      setTimeout(() => {
        resetLoginFields();
        resetRegisterFields();
        onAuthSuccess(data.user, data.token);
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !registerEmail || !registerPhone || !registerPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('You must agree to the Municipal Infrastructure Terms.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email: registerEmail,
          phone: registerPhone,
          role: registerRole,
          password: registerPassword,
          confirmPassword: registerConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setDevOtpPreview(data.devOtpPreview || '');
      setVerifyingPhone(registerPhone);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Callback once OTP is verified
  const handleOtpVerified = (otpData) => {
    if (otpData.token) {
      localStorage.setItem('drainwatch_token', otpData.token);
    }
    setVerifyingPhone(null);
    resetRegisterFields();
    resetLoginFields();
    onAuthSuccess(otpData.user, otpData.token);
  };

  if (verifyingPhone) {
    return (
      <div className="auth-page-wrapper">
        <OtpVerification
          phone={verifyingPhone}
          initialDevOtp={devOtpPreview}
          onVerified={handleOtpVerified}
          onCancel={() => setVerifyingPhone(null)}
        />
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* Left Hero & Social Infrastructure Showcase */}
        <div className="auth-hero-panel">
          <div className="hero-glow-orb"></div>
          <div className="hero-bottom-orb"></div>

          <div className="hero-header">
            <div className="hero-tag">
              <Shield size={14} />
              <span>Smart Social Infrastructure Network</span>
            </div>
            <h1 className="hero-title">
              Drain<span>Watch</span>
            </h1>
            <p className="hero-description">
              Next-generation municipal drainage monitoring, urban stormwater intelligence, and predictive blockage telemetry.
            </p>
          </div>

          <div className="hero-features">
            <div className="hero-feature-item">
              <div className="feature-icon-box">
                <Waves size={20} />
              </div>
              <div className="feature-texts">
                <h4>IoT Sensor Telemetry</h4>
                <p>Real-time water depth, velocity, and catchment basin pressure.</p>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="feature-icon-box" style={{ background: 'rgba(13, 148, 136, 0.2)', color: '#2DD4BF' }}>
                <Activity size={20} />
              </div>
              <div className="feature-texts">
                <h4>Flood Risk Early Warning</h4>
                <p>Automated SMS dispatch and municipal alert protocols.</p>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="feature-icon-box" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#FBBF24' }}>
                <Database size={20} />
              </div>
              <div className="feature-texts">
                <h4>Neon PostgreSQL Resilience</h4>
                <p>High-availability distributed cloud storage with zero data loss.</p>
              </div>
            </div>
          </div>

          <div className="hero-telemetry-badge">
            <div className="telemetry-node-info">
              <Radio size={16} color="#38BDF8" className="animate-pulse" />
              <div>
                <div className="node-title">CENTRAL WATERWAY SENSOR #04</div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Status: Operating Nominal (6.8 m³/s)</div>
              </div>
            </div>
            <div className="node-val">42% Depth</div>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="auth-form-panel">
          {/* Tab Switcher */}
          <div className="form-tab-switcher">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                resetLoginFields();
                resetRegisterFields();
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                resetLoginFields();
                resetRegisterFields();
              }}
            >
              Register Account
            </button>
          </div>

          <div className="form-header">
            <h2 className="form-title">
              {activeTab === 'login' ? 'Welcome to DrainWatch' : 'Create Infrastructure Account'}
            </h2>
            <p className="form-subtitle">
              {activeTab === 'login'
                ? 'Sign in using your verified email address or mobile phone number.'
                : 'Join the municipal drainage surveillance and urban flood resilience team.'}
            </p>
          </div>

          {errorMsg && (
            <div className="alert-banner error">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-banner success">
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email or Phone Number</label>
                <div className="input-container">
                  <span className="input-icon">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="officer@city.gov or +1 (555) 019-2834"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label">
                  <span>Password</span>
                  <button
                    type="button"
                    className="label-right-link"
                    onClick={() => setShowForgotPassword(true)}
                    style={{ background: 'none', border: 'none' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-container">
                  <span className="input-icon">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.75rem 0 1.25rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--navy-900)' }}
                  />
                  Remember terminal credentials
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Don't have an infrastructure account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    resetLoginFields();
                    resetRegisterFields();
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--navy-900)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register Now
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP / REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} autoComplete="off">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-container">
                  <span className="input-icon"><User size={16} /></span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Marcus Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-container">
                    <span className="input-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="name@city.gov"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Phone (for OTP)</label>
                  <div className="input-container">
                    <span className="input-icon"><Smartphone size={16} /></span>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="9876543210"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department / System Role</label>
                <div className="role-grid">
                  {roles.map((r) => {
                    const IconComp = r.icon;
                    const isSelected = registerRole === r.id;
                    return (
                      <div
                        key={r.id}
                        className={`role-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => setRegisterRole(r.id)}
                      >
                        <IconComp size={14} />
                        <span>{r.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-container">
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Min 6 chars"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="input-action-btn"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      tabIndex={-1}
                    >
                      {showRegisterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-container">
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      type={showRegisterConfirmPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Re-enter password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="input-action-btn"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showRegisterConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength indicator */}
              {registerPassword && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <div className="password-strength-bar">
                    <div className={`strength-segment ${passwordStrength >= 1 ? (passwordStrength === 1 ? 'active-weak' : passwordStrength === 2 ? 'active-medium' : 'active-strong') : ''}`}></div>
                    <div className={`strength-segment ${passwordStrength >= 2 ? (passwordStrength === 2 ? 'active-medium' : 'active-strong') : ''}`}></div>
                    <div className={`strength-segment ${passwordStrength >= 3 ? 'active-strong' : ''}`}></div>
                  </div>
                  <div className="strength-hint">
                    <span>Security Rating: {passwordStrength <= 1 ? 'Basic' : passwordStrength === 2 ? 'Good' : 'Strong'}</span>
                    {registerConfirmPassword && registerPassword === registerConfirmPassword && (
                      <span style={{ color: 'var(--success-emerald)', fontWeight: 600 }}>✓ Passwords match</span>
                    )}
                  </div>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem 0' }}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  style={{ accentColor: 'var(--navy-900)' }}
                />
                I agree to the DrainWatch Social Infrastructure & Monitoring Protocols
              </label>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Registering & Generating OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Mobile OTP Verification</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    resetLoginFields();
                    resetRegisterFields();
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--navy-900)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => {
            setShowForgotPassword(false);
            setActiveTab('login');
            setSuccessMsg('Password reset! Please log in with your updated password.');
          }}
        />
      )}
    </div>
  );
}
