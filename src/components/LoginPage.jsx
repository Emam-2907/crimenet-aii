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
    system_status: 'CHECKING',
    database: { connected: false, status: 'CHECKING...' },
    graph: { connected: false, status: 'CHECKING...' }
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

  const fetchSystemStatus = async (retryCount = 0) => {
    setIsCheckingSystem(true);
    try {
      const stat = await api.getSystemConnectivity();
      if (stat && stat.api_online) {
        setConnectivity(stat);
      } else if (retryCount < 2) {
        // Auto-retry once for serverless cold start
        setTimeout(() => fetchSystemStatus(retryCount + 1), 1200);
        return;
      } else {
        setConnectivity(stat || {
          api_online: false,
          system_status: 'OFFLINE',
          database: { connected: false, status: 'OFFLINE' },
          graph: { connected: false, status: 'OFFLINE' }
        });
      }
    } catch (e) {
      console.warn('System status probe error:', e);
      if (retryCount < 2) {
        setTimeout(() => fetchSystemStatus(retryCount + 1), 1200);
        return;
      }
      setConnectivity({
        api_online: false,
        system_status: 'OFFLINE',
        database: { connected: false, status: 'OFFLINE' },
        graph: { connected: false, status: 'OFFLINE' }
      });
    } finally {
      setIsCheckingSystem(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrorMsg('Please select a demo persona or enter a Demo ID.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter the demo password (e.g. demo123).');
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
      setErrorMsg(err.message || 'Authentication failed. Use demo password: demo123');
      setIsLoading(false);
    }
  };

  const demoPersonas = [
    { name: 'Analyst Vance', id: 'analyst.vance@crimenet.demo', role: 'ANALYST', desc: 'Case Analyst' },
    { name: 'Det. Chen', id: 'investigator.chen@crimenet.demo', role: 'INVESTIGATOR', desc: 'Lead Detective' },
    { name: 'Insp. Wright', id: 'supervisor.wright@crimenet.demo', role: 'SUPERVISOR', desc: 'Command Supervisor' },
    { name: 'Command Admin', id: 'admin@crimenet.demo', role: 'ADMIN', desc: 'System Admin' }
  ];

  const handleSelectDemoPersona = (personaId) => {
    setUserId(personaId);
    setPassword('demo123');
    setErrorMsg('');
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
      <header className="classification-bar" style={{
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
            backgroundColor: connectivity.api_online ? 'var(--success)' : '#ef4444'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>SYSTEM STATUS:</span>
          <span style={{
            color: connectivity.api_online ? 'var(--success)' : '#ef4444',
            fontWeight: 600
          }}>
            {connectivity.api_online
              ? `API ONLINE [${connectivity.system_status === 'DEMO_ACTIVE' ? 'DEMO PROTOTYPE' : (connectivity.system_status || 'LIVE')}]`
              : 'BACKEND CONNECTING / OFFLINE'}
          </span>
        </div>

        <div style={{
          color: 'var(--text-secondary)',
          fontWeight: 600,
          fontSize: '0.72rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            ACADEMIC PROTOTYPE
          </span>
          <span>SYNTHETIC DEMO DATA ONLY</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)' }}>
          <span>NODE: DEMO-01</span>
          <span>{currentTimeUtc}</span>
        </div>
      </header>

      {/* Main Single Login Card Container */}
      <main style={{
        width: '100%',
        maxWidth: '460px',
        zIndex: 10,
        marginTop: '24px'
      }}>

        {/* Card Body */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '28px 26px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>

          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              marginBottom: '10px',
              color: 'var(--accent)'
            }}>
              <Shield size={24} strokeWidth={2.2} />
            </div>

            <h1 style={{
              margin: '0 0 4px 0',
              fontFamily: 'var(--font-display)',
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}>
              CRIMENET AI
            </h1>

            <p style={{
              margin: 0,
              fontSize: '0.80rem',
              color: 'var(--text-secondary)',
              fontWeight: 400
            }}>
              Academic Graph Intelligence & Autonomous Investigation Prototype
            </p>
          </div>

          {/* Academic / Research Prototype Disclaimer Banner */}
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '6px',
            padding: '9px 12px',
            marginBottom: '18px',
            fontSize: '0.73rem',
            color: '#93c5fd',
            lineHeight: 1.45,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Shield size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#60a5fa' }} />
            <div>
              <strong>Academic Research Prototype:</strong> This software uses 100% synthetic demonstration data for evaluation. Not affiliated with any real-world law enforcement or government entity.
            </div>
          </div>

          {/* Feedback Error Banner */}
          {errorMsg && (
            <div role="alert" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
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
            <div role="status" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
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

          {/* Demo Persona Quick-Selector (1-Click Fill) */}
          <div style={{
            marginBottom: '18px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            padding: '10px 12px'
          }}>
            <div style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <User size={12} color="var(--accent)" />
              DEMO PERSONAS (1-CLICK AUTO-FILL):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {demoPersonas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectDemoPersona(p.id)}
                  style={{
                    backgroundColor: userId === p.id ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-surface)',
                    border: userId === p.id ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.72rem', color: userId === p.id ? '#93c5fd' : 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    {p.role} · {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form (User ID & Password) */}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>

            {/* Field 1: User ID */}
            <div style={{ marginBottom: '14px' }}>
              <label htmlFor="login-user-id" style={{
                display: 'block',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}>
                DEMO ACCOUNT / USER ID
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
                  placeholder="e.g. analyst.vance@crimenet.demo"
                  disabled={isLoading || authSuccess}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px'
                  }}
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--text-secondary)'
                }}>
                  DEMO PASSWORD
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
                  placeholder="Enter demo password (e.g. demo123)"
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Session */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
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
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Default: <code>demo123</code>
              </span>
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
                  <span>INITIALIZING PROTOTYPE...</span>
                </>
              ) : authSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>ACCESS CONFIRMED</span>
                </>
              ) : (
                <>
                  <span>Launch Research Prototype</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Academic Prototype Notice */}
          <div style={{
            marginTop: '18px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4
          }}>
            100% synthetic demonstration data for academic and evaluation purposes only. No real-world credentials or personal data are collected.
          </div>
        </div>

        {/* Live Backend, Database & Graph Connectivity Status Bar */}
        <aside aria-label="System Connectivity Telemetry" style={{
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
            color: 'var(--text-secondary, #94a3b8)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.68rem',
            fontWeight: 600
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={13} color="var(--blue-light, #38bdf8)" />
              SYSTEM TELEMETRY
            </span>
            <button
              type="button"
              onClick={fetchSystemStatus}
              disabled={isCheckingSystem}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #64748b)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.65rem'
              }}
              title="Ping Backend Services"
            >
              <RefreshCw size={11} style={{ animation: isCheckingSystem ? 'spin 1s linear infinite' : 'none' }} />
              PROBE
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
              <Database size={14} color={connectivity.api_online ? 'var(--success)' : '#ef4444'} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.7rem' }}>
                  Database
                </div>
                <div style={{
                  color: connectivity.api_online ? 'var(--success)' : '#ef4444',
                  fontSize: '0.65rem'
                }}>
                  {connectivity.api_online
                    ? `Connected (${connectivity.services?.database?.case_count || 4} Cases)`
                    : 'OFFLINE'}
                </div>
              </div>
            </div>

            {/* Neo4j / Graph Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-elevated)',
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)'
            }}>
              <Share2 size={14} color={connectivity.api_online ? 'var(--success)' : '#ef4444'} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.7rem' }}>
                  Graph Engine
                </div>
                <div style={{
                  color: connectivity.api_online ? 'var(--success)' : '#ef4444',
                  fontSize: '0.65rem',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}>
                  {!connectivity.api_online
                    ? 'OFFLINE'
                    : (connectivity.services?.graph?.connected ? 'Live Neo4j' : 'Active (Local Cache)')}
                </div>
              </div>
            </div>
          </div>
        </aside>

      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
