import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield, Lock, User, Eye, EyeOff, CheckCircle2,
  AlertTriangle, Database, Share2, Server, ArrowRight,
  RefreshCw, Terminal, Activity, Key
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const auth = useAuth ? useAuth() : null;
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
  const [quickProfiles, setQuickProfiles] = useState([
    { name: 'Special Agent Vance', id: 'analyst.vance@crimenet.demo', email: 'analyst.vance@crimenet.demo', role: 'SENIOR_ANALYST', clearance: 'TS//SCI-TK-NOFORN' },
    { name: 'Detective Chen', id: 'investigator.chen@crimenet.demo', email: 'investigator.chen@crimenet.demo', role: 'INVESTIGATOR', clearance: 'SECRET' },
    { name: 'Inspector Wright', id: 'supervisor.wright@crimenet.demo', email: 'supervisor.wright@crimenet.demo', role: 'CASE_SUPERVISOR', clearance: 'TOP_SECRET' },
    { name: 'Command Admin', id: 'admin@crimenet.demo', email: 'admin@crimenet.demo', role: 'SYSTEM_ADMIN', clearance: 'TS//SCI' }
  ]);

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

    // Fetch demo profiles securely from backend
    api.getDemoProfiles().then(res => {
      if (res && res.profiles && res.profiles.length > 0) {
        setQuickProfiles(res.profiles.map(p => ({
          name: p.full_name || p.name || p.email,
          id: p.email,
          email: p.email,
          role: p.role,
          clearance: p.clearance,
          badge_id: p.badge_id
        })));
      }
    }).catch(err => {
      console.warn('Could not fetch dynamic demo profiles:', err);
    });

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

  const handleQuickLogin = async (profileEmail) => {
    setErrorMsg('');
    setIsLoading(true);
    setUserId(profileEmail);
    setPassword('demo123');
    try {
      let loggedUser;
      if (auth && auth.demoLogin) {
        loggedUser = await auth.demoLogin(profileEmail);
      } else {
        const res = await api.demoLogin(profileEmail);
        loggedUser = res.user;
      }
      setAuthSuccess(true);
      if (onLoginSuccess && loggedUser) {
        setTimeout(() => onLoginSuccess(loggedUser), 500);
      }
    } catch (err) {
      console.error('Quick demo login error:', err);
      setErrorMsg(err.message || 'Demo authentication failed.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrorMsg('Please enter your User ID, Badge ID, or Email.');
      return;
    }
    
    // In demo environment, default empty password to standard demo123
    const effectivePassword = password || 'demo123';
    if (!password) {
      setPassword('demo123');
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      let loggedUser;
      if (auth && auth.login) {
        const res = await auth.login(userId.trim(), effectivePassword);
        loggedUser = res?.user || res;
      } else {
        const res = await api.login(userId.trim(), effectivePassword);
        loggedUser = res.user;
      }
      setAuthSuccess(true);
      if (onLoginSuccess && loggedUser) {
        setTimeout(() => onLoginSuccess(loggedUser), 500);
      }
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
            backgroundColor: connectivity.api_online ? 'var(--success)' : 'var(--critical)'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>SYSTEM STATUS:</span>
          <span style={{
            color: connectivity.api_online ? 'var(--success)' : 'var(--critical)',
            fontWeight: 600
          }}>
            {connectivity.api_online
              ? `API ONLINE [${connectivity.system_status || 'ACTIVE'}]`
              : 'BACKEND OFFLINE (Unreachable)'}
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
      </header>

      {/* Main Single Login Card Container */}
      <main style={{
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
            <div role="alert" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--critical-dim)',
              border: '1px solid var(--critical-border)',
              color: 'var(--critical)',
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
              backgroundColor: 'var(--success-dim)',
              border: '1px solid var(--success-border)',
              color: 'var(--success)',
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>

            {/* Field 1: User ID */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="login-user-id" style={{
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
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{
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
                  placeholder="Enter security access password"
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

            {/* Quick Profile Autofill Helpers */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  QUICK SIGN-IN PERSONA:
                </span>
                <span style={{ fontSize: '0.64rem', color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>
                  Click to Auto-Sign In
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {quickProfiles.map(p => (
                  <button
                    key={p.email || p.id}
                    type="button"
                    disabled={isLoading || authSuccess}
                    onClick={() => {
                      setUserId(p.email || p.id);
                      handleQuickLogin(p.email || p.id);
                    }}
                    title={`${p.name} · ${p.role} · ${p.badge_id || ''}`}
                    style={{
                      background: userId === (p.email || p.id) ? 'var(--accent)' : 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      color: userId === (p.email || p.id) ? '#fff' : 'var(--text-primary)',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>{p.name}</span>
                    {p.badge_id && (
                      <span style={{
                        fontSize: '0.60rem',
                        fontFamily: 'var(--font-mono)',
                        opacity: 0.75,
                        background: 'rgba(0,0,0,0.2)',
                        padding: '1px 4px',
                        borderRadius: '2px'
                      }}>
                        {p.badge_id}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{
                marginTop: '8px',
                padding: '6px 10px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '4px',
                fontSize: '0.68rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Demo Password: <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>demo123</strong></span>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Any persona or badge ID</span>
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
            Authorized personnel only. All activity is audited.
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
              <Activity size={13} color="var(--accent-hover)" />
              SYSTEM TELEMETRY
            </span>
            <button
              type="button"
              onClick={fetchSystemStatus}
              disabled={isCheckingSystem}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
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
              <Database size={14} color={connectivity.api_online ? 'var(--success)' : 'var(--critical)'} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.7rem' }}>
                  Database
                </div>
                <div style={{
                  color: connectivity.api_online ? 'var(--success)' : 'var(--critical)',
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
              <Share2 size={14} color={connectivity.api_online ? 'var(--success)' : 'var(--critical)'} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.7rem' }}>
                  Graph Engine
                </div>
                <div style={{
                  color: connectivity.api_online ? 'var(--success)' : 'var(--critical)',
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
