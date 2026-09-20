import React, { useState } from 'react';
import { KeyRound, Smartphone, Lock, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ForgotPasswordModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = Enter phone, 2 = Enter OTP and new password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setErrorMsg('Please enter your registered mobile number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch reset OTP');
      }

      setDevOtp(data.devOtpPreview || '');
      setStep(2);
      setSuccessMsg('Reset verification code sent to your mobile number!');
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmNewPassword) {
      setErrorMsg('Please complete all required fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword, confirmNewPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccessMsg('Password reset successful! You can now log in.');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 25, 47, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem',
    }}>
      <div className="otp-card" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        <div className="otp-icon-wrap">
          <KeyRound size={28} />
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
          Reset Account Access
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {step === 1
            ? 'Enter your registered mobile phone number to receive a verification code.'
            : `Enter the code sent to ${phone} and set your new password.`}
        </p>

        {errorMsg && (
          <div className="alert-banner error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner success">
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {devOtp && step === 2 && (
          <div className="demo-otp-banner" style={{ marginBottom: '1rem' }}>
            <span>Dev Preview Code: <strong>{devOtp}</strong></span>
            <button
              type="button"
              onClick={() => setOtp(devOtp)}
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: '#854D0E',
                color: '#FFF',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Fill
            </button>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendResetOtp}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Registered Mobile Number</label>
              <div className="input-container">
                <span className="input-icon"><Smartphone size={16} /></span>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+1 (555) 019-2834 or 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Send Verification Code'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-outline"
              style={{ marginTop: '0.75rem' }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">6-Digit Verification Code</label>
              <div className="input-container">
                <span className="input-icon"><Smartphone size={16} /></span>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-container">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-container">
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Update Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary-outline"
              style={{ marginTop: '0.75rem' }}
            >
              <ArrowLeft size={14} /> Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
