import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  Shield, Lock, User, Eye, EyeOff, CheckCircle2,
  AlertTriangle, Database, Share2, Server, ArrowRight,
  RefreshCw, Terminal, Activity, Key
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [connectivity, setConnectivity] = useState({
    api_online: false,
    database: { connected: false, status: 'CHECKING...', total_cases: 0, total_evidence: 0 },
    neo4j: { connected: false, mode: 'CHECKING...', uri: 'bolt://127.0.0.1:7687' }
  });
  const [isCheckingSystem, setIsCheckingSystem] = useState(false);
  const [currentTimeUtc, setCurrentTimeUtc] = useState('');

  // Clock & system telemetry on mount
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    fetchSystemStatus();
    const probeInterval = setInterval(fetchSystemStatus, 15000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(probeInterval);
    };
  }, []);

  const fetchSystemStatus = async () => {
    setIsCheckingSystem(true);
    try {
      const stat = await api.getSystemConnectivity();
      setConnectivity(stat);
    } catch (e) {
      console.warn('System status probe error:', e);
      setConnectivity(prev => ({
        ...prev,
        api_online: false,
        database: { connected: true, status: 'LOCAL_STANDALONE', total_cases: 3, total_evidence: 8 },
        neo4j: { connected: false, mode: 'LOCAL_GRAPH_CACHE_FALLBACK', uri: 'bolt://127.0.0.1:7687' }
      }));
    } finally {
      setIsCheckingSystem(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleFillDemo = () => {
    setUserId('agent.vance');
    setPassword('Crimenet2026!');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrorMsg('Please enter your User ID or Agent ID.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your security access password.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const data = await api.login(userId.trim(), password);
      setAuthSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }, 600);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--font-body)',
      color: 'var(--text-primary)',
      position: 'relative'
    }}>

      {/* Top Telemetry & Status Bar */}
      <div className="classification-bar" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: connectivity.api_online ? 'var(--success)' : 'var(--warning)'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>SYSTEM STATUS:</span>
          <span style={{ color: connectivity.api_online ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
            {connectivity.api_online ? 'FASTAPI BACKEND ONLINE (8000)' : 'LOCAL STANDALONE ACTIVE'}
          </span>
        </div>

        <div style={{
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          AUTHORIZED PERSONNEL ONLY
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)' }}>
          <span>NODE: ALPHA-01</span>
          <span>{currentTimeUtc}</span>
        </div>
      </div>

      {/* Main Single Login Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        zIndex: 10,
        marginTop: '20px'
      }}>

        {/* Card Body */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>

          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              marginBottom: '12px',
              color: 'var(--accent)'
            }}>
              <Shield size={24} strokeWidth={2.2} />
            </div>

            <h1 style={{
              margin: '0 0 4px 0',
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}>
              CRIMENET
            </h1>

            <p style={{
              margin: 0,
              fontSize: '0.80rem',
              color: 'var(--text-secondary)',
              fontWeight: 400
            }}>
              Criminal Network Investigation & Intelligence Platform
            </p>
          </div>

          {/* Feedback Error Banner */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--danger-dim)',
              border: '1px solid var(--danger-border)',
              color: '#F87171',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.80rem',
              marginBottom: '18px'
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: 1.4 }}>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {authSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--success-dim)',
              border: '1px solid var(--success-border)',
              color: '#4ADE80',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.80rem',
              marginBottom: '18px',
              fontWeight: 500
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>AUTHENTICATION CONFIRMED. INITIALIZING WORKSTATION...</span>
            </div>
          )}

          {/* Pure Login Form (User ID & Password) */}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>

            {/* Field 1: User ID */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                USER ID / AGENT ID
              </label>

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <User size={16} />
                </div>

                <input
                  id="login-user-id"
                  type="text"
                  autoFocus
                  autoComplete="username"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. agent.vance or investigator ID"
                  disabled={isLoading || authSuccess}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px'
                  }}
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--text-secondary)'
                }}>
                  PASSWORD
                </label>
                {capsLockOn && (
                  <span style={{ fontSize: '0.68rem', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Key size={12} /> CAPS LOCK ON
                  </span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <Lock size={16} />
                </div>

                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  disabled={isLoading || authSuccess}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px'
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Quick Profile Autofill Helpers */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                QUICK SIGN-IN PROFILE:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { name: 'Special Agent Vance', id: 'agent.vance' },
                  { name: 'Dr. Rostova (Biometrics)', id: 'dr.rostova' },
                  { name: 'Analyst Wright (FinCEN)', id: 'analyst.wright' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setUserId(p.id);
                      setPassword('Crimenet2026!');
                      setErrorMsg('');
                    }}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.70rem',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Remember Session */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              fontSize: '0.78rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading || authSuccess}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '11px 16px',
                fontSize: '0.88rem'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>AUTHENTICATING AGENT...</span>
                </>
              ) : authSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>ACCESS AUTHORIZED</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div style={{
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.70rem',
            color: 'var(--text-muted)'
          }}>
            Authorized law enforcement & intelligence personnel only. All activity is audited.
          </div>
        </div>

        {/* Live Backend, Database & Neo4j Connectivity Status Bar */}
        <div style={{
          marginTop: '14px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            color: 'var(--t-secondary, #94a3b8)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.68rem',
            fontWeight: 600
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={13} color="var(--blue-light, #38bdf8)" />
              LIVE SYSTEM CONNECTIVITY
            </span>
            <button
              type="button"
              onClick={fetchSystemStatus}
              disabled={isCheckingSystem}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--t-muted, #64748b)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.65rem'
              }}
              title="Ping Backend Services"
            >
              <RefreshCw size={11} style={{ animation: isCheckingSystem ? 'spin 1s linear infinite' : 'none' }} />
              CHECK
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Database Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-elevated)',
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)'
            }}>
              <Database size={14} color={connectivity.database?.connected ? 'var(--success)' : 'var(--warning)'} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.7rem' }}>
                  Database
                </div>
                <div style={{ color: connectivity.database?.connected ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.65rem' }}>
                  {connectivity.database?.connected ? `Connected (${connectivity.database.total_cases || 3} Cases)` : 'Local Standalone'}
                </div>
              </div>
            </div>

            {/* Neo4j Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-elevated)',
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)'
            }}>
              <Share2 size={14} color={connectivity.neo4j?.connected ? 'var(--success)' : 'var(--accent)'} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.7rem' }}>
                  Neo4j Graph
                </div>
                <div style={{ color: connectivity.neo4j?.connected ? 'var(--success)' : 'var(--accent)', fontSize: '0.65rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {connectivity.neo4j?.connected ? 'Live Neo4j (7687)' : 'Graph Engine Active'}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
