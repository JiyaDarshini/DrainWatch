import React, { useState } from 'react';
import { KeyRound, Smartphone, Lock, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { safeJson } from '../utils/api';

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
      const data = await safeJson(res);
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

      const data = await safeJson(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccessMsg(data.message || 'Password reset successful! Opening Dashboard...');
      if (data.token) {
        localStorage.setItem('drainwatch_token', data.token);
      }
      setTimeout(() => {
        onSuccess(data.user, data.token);
      }, 900);
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
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(10, 25, 47, 0.35)',
        border: '1px solid var(--border-beige)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--bg-secondary)',
            color: 'var(--water-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-beige)'
          }}>
            <KeyRound size={20} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary-outline"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            Cancel
          </button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
          {step === 1 ? 'Reset Infrastructure Access' : 'Set New Password'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {step === 1 
            ? 'Enter your registered phone number to receive a secure password reset OTP code.' 
            : `Enter the code sent to ${phone} and set your new password.`}
        </p>

        {errorMsg && (
          <div className="alert-banner error" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner success" style={{ marginBottom: '1rem' }}>
            <CheckCircle size={16} />
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
