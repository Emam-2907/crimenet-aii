import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Shield, Eye, EyeOff, Loader2, Lock, CheckCircle2 } from 'lucide-react';

const DEMO_PASSWORD_MAP = {
  'analyst.vance@crimenet.demo': 'Crimenet2026!',
  'investigator.chen@crimenet.demo': 'Investigator2026!',
  'supervisor.wright@crimenet.demo': 'Supervisor2026!',
  'admin@crimenet.demo': 'Admin2026!'
};

function normalizeIdentifier(input) {
  const trimmed = (input || '').trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'vance' || lower === 'analyst.vance' || lower === 'agent vance' || lower === 'marcus') {
    return 'analyst.vance@crimenet.demo';
  }
  if (lower === 'chen' || lower === 'investigator.chen' || lower === 'det. chen' || lower === 'sarah') {
    return 'investigator.chen@crimenet.demo';
  }
  if (lower === 'wright' || lower === 'supervisor.wright' || lower === 'insp. wright' || lower === 'thomas') {
    return 'supervisor.wright@crimenet.demo';
  }
  if (lower === 'admin' || lower === 'administrator') {
    return 'admin@crimenet.demo';
  }
  return trimmed;
}

export default function LoginPage({ onLoginSuccess }) {
  const auth = useAuth ? useAuth() : null;

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');

    const cleanId = id.trim();
    let cleanPassword = password.trim();

    if (!cleanId || !cleanPassword) {
      setErrorMsg('Please enter investigator ID and credential. (Demo: analyst.vance / Crimenet2026!)');
      return;
    }

    const resolvedId = normalizeIdentifier(cleanId);
    if (cleanPassword === 'demo123' && DEMO_PASSWORD_MAP[resolvedId]) {
      cleanPassword = DEMO_PASSWORD_MAP[resolvedId];
    }

    setIsLoading(true);

    try {
      let loggedUser;
      if (auth && auth.login) {
        loggedUser = await auth.login(resolvedId, cleanPassword);
      } else {
        const res = await api.login(resolvedId, cleanPassword);
        loggedUser = res.user;
      }

      if (onLoginSuccess && loggedUser) {
        onLoginSuccess(loggedUser);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Authentication rejected. Verify credentials or agency clearance.');
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail) => {
    setId(roleEmail);
    setPassword(DEMO_PASSWORD_MAP[roleEmail] || 'Crimenet2026!');
    setErrorMsg('');
  };

  return (
    <div className="login-page">
      {/* Tactical Background Grid Overlay */}
      <div className="tactical-bg-grid" aria-hidden="true" />

      {/* Login Card */}
      <div className="login-card">
        {/* Authoritative Badge Emblem */}
        <div className="badge-header">
          <div className="emblem-wrapper">
            <Shield size={24} style={{ color: 'var(--coral, #DA7667)' }} />
          </div>
          <div className="classification-pill">
            RESTRICTED ACCESS · LAW ENFORCEMENT ONLY
          </div>
        </div>

        {/* Title */}
        <h1>CRIMENET AI</h1>
        <p className="subtitle">Relational Intelligence & Investigative Command System</p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="investigator-id">Investigator Identifier / Email</label>
          <input
            id="investigator-id"
            type="text"
            placeholder="e.g. analyst.vance"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
            disabled={isLoading}
          />

          <label htmlFor="investigator-password">Security Clearance Credential</label>
          <div style={{ position: 'relative' }}>
            <input
              id="investigator-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter clearance password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                boxShadow: 'none',
                color: 'var(--text-muted, #7E8B9B)',
                padding: '4px',
                margin: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Quick Credential Presets */}
          <div className="quick-roles">
            <span className="quick-label">DEMO CLEARANCES:</span>
            <button type="button" onClick={() => handleQuickFill('analyst.vance@crimenet.demo')}>Analyst</button>
            <button type="button" onClick={() => handleQuickFill('investigator.chen@crimenet.demo')}>Detective</button>
            <button type="button" onClick={() => handleQuickFill('supervisor.wright@crimenet.demo')}>Supervisor</button>
          </div>

          {/* Login Action Button */}
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>AUTHENTICATING CLEARANCE...</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={14} />
                <span>ENTER COMMAND WORKSTATION</span>
              </span>
            )}
          </button>

          {/* Feedback Message */}
          {errorMsg && (
            <div className="error-message" role="alert">
              {errorMsg}
            </div>
          )}
        </form>

        {/* Footer Text */}
        <div className="footer-bar">
          <span>SECURE PROTOCOL TLS 1.3</span>
          <span>·</span>
          <span>DOCKET ARCHITECTURE v4.2</span>
        </div>
      </div>

      {/* Embedded Styles with Velvet / Rouge / Burgundy Palette */}
      <style>{`
        .login-page {
          background-color: var(--bg-main, #0C0E14);
          background-image: radial-gradient(circle at 50% 15%, #23161A 0%, #0C0E14 70%);
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100%;
          display: flex;
          position: relative;
          overflow: hidden;
          font-family: var(--font-sans, 'Inter', -apple-system, sans-serif);
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
        }

        .tactical-bg-grid {
          position: absolute;
          inset: 0;
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(118, 81, 84, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(118, 81, 84, 0.08) 1px, transparent 1px);
          pointer-events: none;
        }

        .login-card {
          z-index: 2;
          text-align: center;
          background: var(--bg-surface, #151922);
          border: 1px solid rgba(118, 81, 84, 0.45);
          border-radius: 12px;
          width: 440px;
          max-width: 100%;
          padding: 34px 30px 26px;
          box-sizing: border-box;
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .login-card:hover {
          border-color: rgba(173, 84, 92, 0.6);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 20px rgba(173, 84, 92, 0.12);
        }

        .badge-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .emblem-wrapper {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          background: rgba(51, 37, 41, 0.85);
          border: 1px solid rgba(173, 84, 92, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }

        .classification-pill {
          font-size: 0.64rem;
          font-family: var(--font-mono, monospace);
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 3px 10px;
          border-radius: 4px;
          background: rgba(173, 84, 92, 0.15);
          border: 1px solid rgba(173, 84, 92, 0.35);
          color: var(--coral, #DA7667);
        }

        .login-card h1 {
          color: var(--text-primary, #F3F5F9);
          margin: 0 0 6px 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .login-card .subtitle {
          color: var(--text-secondary, #A2ABB9);
          margin: 0 0 22px 0;
          font-size: 13px;
          line-height: 1.4;
        }

        .login-card form {
          text-align: left;
        }

        .login-card label {
          color: var(--text-primary, #F3F5F9);
          margin-top: 14px;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          display: block;
        }

        .login-card form > label:first-of-type {
          margin-top: 0;
        }

        .login-card input {
          color: var(--text-primary, #F3F5F9);
          background: var(--bg-elevated, #1E2430);
          border: 1px solid var(--border-default, #2A3342);
          border-radius: 6px;
          outline: none;
          width: 100%;
          padding: 10px 14px;
          font-size: 13px;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit;
        }

        .login-card input:focus {
          border-color: var(--rouge, #AD545C);
          box-shadow: 0 0 0 2px rgba(173, 84, 92, 0.25);
        }

        .login-card input::placeholder {
          color: var(--text-muted, #626F80);
        }

        .quick-roles {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .quick-label {
          font-size: 0.62rem;
          color: var(--text-muted, #7E8B9B);
          font-family: var(--font-mono, monospace);
          font-weight: 600;
        }

        .quick-roles button {
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 0.64rem;
          font-family: var(--font-mono, monospace);
          background: var(--bg-elevated, #1E2430);
          border: 1px solid var(--border-default, #2A3342);
          color: var(--text-secondary, #A2ABB9);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .quick-roles button:hover {
          border-color: var(--rouge, #AD545C);
          color: var(--coral, #DA7667);
          background: rgba(173, 84, 92, 0.12);
        }

        .login-card .login-btn {
          color: #FFFFFF;
          cursor: pointer;
          background: var(--rouge, #AD545C);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          margin-top: 20px;
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 12px rgba(173, 84, 92, 0.25);
          transition: background 0.15s ease, transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          font-family: inherit;
        }

        .login-card .login-btn:hover:not(:disabled) {
          background: #BD6069;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(173, 84, 92, 0.35);
        }

        .login-card .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-card .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-card .error-message {
          color: var(--coral, #DA7667);
          text-align: center;
          background: rgba(173, 84, 92, 0.14);
          border: 1px solid rgba(173, 84, 92, 0.35);
          border-radius: 6px;
          margin-top: 14px;
          margin-bottom: 0;
          padding: 8px 12px;
          font-size: 12px;
        }

        .login-card .footer-bar {
          color: var(--text-muted, #7E8B9B);
          margin-top: 22px;
          font-size: 10px;
          font-family: var(--font-mono, monospace);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          letter-spacing: 0.05em;
          border-top: 1px solid var(--border-default, #2A3342);
          padding-top: 14px;
          user-select: none;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 26px 20px 20px;
          }
          .login-card h1 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
