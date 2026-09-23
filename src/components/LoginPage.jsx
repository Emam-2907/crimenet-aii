import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const STARS = [
  { top: '15%', left: '7%', size: '3px', opacity: 0.85, glow: true },
  { top: '14%', left: '25%', size: '2.5px', opacity: 0.9, glow: true },
  { top: '19%', left: '37%', size: '2px', opacity: 0.6 },
  { top: '17%', left: '49%', size: '2px', opacity: 0.75 },
  { top: '15%', left: '68%', size: '2.5px', opacity: 0.85 },
  { top: '14%', left: '92%', size: '3px', opacity: 0.9, glow: true },
  { top: '19%', left: '95%', size: '2px', opacity: 0.7 },
  { top: '48%', left: '9%', size: '2px', opacity: 0.55 },
  { top: '38%', left: '94%', size: '2px', opacity: 0.6 },
  { top: '91%', left: '65%', size: '2.5px', opacity: 0.8 },
  { top: '95%', left: '33%', size: '2px', opacity: 0.7 },
  { top: '95%', left: '80%', size: '2.5px', opacity: 0.85 }
];



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
      setErrorMsg('Please enter username and password. (Demo: analyst.vance / demo123)');
      return;
    }

    const resolvedId = normalizeIdentifier(cleanId);

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
      setErrorMsg(err.message || 'Incorrect ID or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Star Specks */}
      <div className="stars-container" aria-hidden="true">
        {STARS.map((star, idx) => (
          <span
            key={idx}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              backgroundColor: '#fff',
              opacity: star.opacity,
              boxShadow: star.glow ? '0 0 6px #93c5fd' : 'none',
              pointerEvents: 'none'
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Detective Logo */}
        <div className="logo" role="img" aria-label="Detective logo">
          🕵️
        </div>

        {/* Header */}
        <h1>CRIMENET AI</h1>
        <p className="subtitle">Criminal Network Analysis System</p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="investigator-id">Investigator ID</label>
          <input
            id="investigator-id"
            type="text"
            placeholder="Enter your ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
            disabled={isLoading}
          />

          <label htmlFor="investigator-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="investigator-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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
                color: '#64748b',
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

          {/* Left-Aligned Login Action Button */}
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>LOGGING IN...</span>
              </span>
            ) : (
              'LOGIN'
            )}
          </button>

          {/* Feedback Message */}
          {errorMsg && (
            <p className="error-message" role="alert">
              {errorMsg}
            </p>
          )}
        </form>

        {/* Footer Text */}
        <p className="footer-text">AI-Powered Crime Investigation Platform</p>
      </div>

      {/* Embedded Component Styles */}
      <style>{`
        .login-page {
          background: radial-gradient(circle at 20% 20%, #173a70 0, transparent 35%),
                      radial-gradient(circle at 80% 80%, #17245c 0, transparent 35%),
                      #060b16;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100%;
          display: flex;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 16px;
          box-sizing: border-box;
        }

        .login-page::before {
          content: "";
          border: 1px solid rgba(79, 140, 255, 0.15);
          border-radius: 50%;
          width: 500px;
          height: 500px;
          animation: 5s ease-in-out infinite pulseRing;
          position: absolute;
          pointer-events: none;
        }

        .login-page::after {
          content: "";
          background: rgba(79, 140, 255, 0.08);
          border-radius: 50%;
          width: 280px;
          height: 280px;
          animation: 7s ease-in-out infinite loginFloatTwo;
          position: absolute;
          bottom: -100px;
          right: -90px;
          pointer-events: none;
        }

        .stars-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .login-card {
          z-index: 2;
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
          text-align: center;
          background: rgba(17, 28, 46, 0.88);
          border: 1px solid #2b4168;
          border-radius: 20px;
          width: 400px;
          max-width: 100%;
          padding: 40px 32px 30px;
          box-sizing: border-box;
          animation: 0.7s ease-out loginCardEnter;
          position: relative;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.55);
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
        }

        .login-card:hover {
          border-color: #4f8cff;
          box-shadow: 0 25px 80px rgba(37, 87, 197, 0.2);
        }

        .login-card .logo {
          margin-bottom: 12px;
          font-size: 52px;
          line-height: 1;
          display: inline-block;
          animation: 3s ease-in-out infinite logoFloat;
          user-select: none;
        }

        .login-card h1 {
          color: #ffffff;
          margin: 0 0 8px 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .login-card .subtitle {
          color: #9aa8bd;
          margin: 0 0 28px 0;
          font-size: 14px;
        }

        .login-card form {
          text-align: left;
        }

        .login-card label {
          color: #dce2ef;
          margin-top: 18px;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          display: block;
        }

        .login-card form > label:first-of-type {
          margin-top: 0;
        }

        .login-card input {
          color: #ffffff;
          background: rgba(8, 17, 31, 0.9);
          border: 1px solid #30425f;
          border-radius: 10px;
          outline: none;
          width: 100%;
          padding: 13px 15px;
          font-size: 14px;
          box-sizing: border-box;
          transition: all 0.25s ease;
          font-family: inherit;
        }

        .login-card input:focus {
          border-color: #5b8cff;
          box-shadow: 0 0 0 3px rgba(91, 140, 255, 0.15), 0 0 18px rgba(91, 140, 255, 0.12);
          transform: translateY(-1px);
        }

        .login-card input::placeholder {
          color: #5a6e8c;
        }

        .login-card .login-btn {
          color: #ffffff;
          cursor: pointer;
          background: linear-gradient(135deg, #3568e8, #2457c5);
          border: none;
          border-radius: 10px;
          margin-top: 24px;
          padding: 12px 28px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.05em;
          box-shadow: 0 8px 25px rgba(36, 87, 197, 0.25);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          display: inline-block;
          font-family: inherit;
        }

        .login-card .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(53, 104, 232, 0.4);
        }

        .login-card .login-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .login-card .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-card .error-message {
          color: #f87171;
          text-align: center;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
          margin-top: 18px;
          margin-bottom: 0;
          padding: 10px 12px;
          font-size: 13px;
          animation: 0.3s ease-out messageFade;
        }

        .login-card .footer-text {
          color: #69758f;
          margin-top: 26px;
          margin-bottom: 0;
          font-size: 12px;
          text-align: center;
          user-select: none;
        }

        @keyframes pulseRing {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }

        @keyframes loginFloatTwo {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -25px); }
        }

        @keyframes loginCardEnter {
          0% { opacity: 0; transform: translateY(25px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes messageFade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 22px 24px;
            border-radius: 18px;
          }
          .login-card h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
