import React, { useState } from 'react';
import { api } from '../services/api.js';
import { soundFx } from '../utils/audio.js';
import { Shield, Lock, UserCheck, X, Key, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('agent.vance@crimenet.gov');
  const [password, setPassword] = useState('Crimenet2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    soundFx.playTacticalClick();

    try {
      const res = await api.login(email, password);
      soundFx.playSuccessChime();
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg('Authentication failed. Check credentials or use demo bypass.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoQuickLogin = () => {
    setEmail('agent.vance@crimenet.gov');
    setPassword('Crimenet2026!');
    handleLogin();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid var(--cyan-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={20} color="var(--cyan-primary)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                Secure Analyst Sign-In
              </h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                FEDERATED INTELLIGENCE GATEWAY
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Demo Persona Email / Badge ID
            </label>
            <input
              type="text"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
              placeholder="e.g. analyst.vance@crimenet.demo"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Demo Access Code
            </label>
            <input
              type="text"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', WebkitTextSecurity: 'disc' }}
              placeholder="demo123"
            />
          </div>

          {errorMsg && (
            <div style={{ fontSize: '0.75rem', color: 'var(--crimson-alert)', fontFamily: 'var(--font-mono)' }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
          >
            <Lock size={15} />
            {isLoading ? 'Verifying Credentials...' : 'Authenticate Clearance'}
          </button>

          {/* Quick Demo Login Preset Button */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              HACKATHON / EVALUATOR PRESET:
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Clearance: <strong>TS/SCI-ORCON</strong> (Chief Analyst Marcus Vance)
            </div>
            <button
              type="button"
              onClick={handleDemoQuickLogin}
              className="btn-ghost"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '0.8rem',
                borderColor: 'var(--cyan-border)',
                color: 'var(--cyan-primary)'
              }}
            >
              <UserCheck size={14} /> One-Click Demo Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
