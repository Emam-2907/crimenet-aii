import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield, User, ArrowRight, RefreshCw, Activity,
  Database, Share2, CheckCircle2, AlertTriangle, Check
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const auth = useAuth ? useAuth() : null;
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
    {
      name: 'Agent Vance',
      label: 'Demo Senior Analyst',
      id: 'analyst.vance@crimenet.demo',
      email: 'analyst.vance@crimenet.demo',
      role: 'SENIOR_ANALYST',
      clearance: 'Simulated Level-4',
      badge_id: 'SIM-BADGE-092'
    },
    {
      name: 'Detective Chen',
      label: 'Demo Field Investigator',
      id: 'investigator.chen@crimenet.demo',
      email: 'investigator.chen@crimenet.demo',
      role: 'INVESTIGATOR',
      clearance: 'Simulated Level-3',
      badge_id: 'SIM-BADGE-144'
    },
    {
      name: 'Inspector Wright',
      label: 'Demo Case Supervisor',
      id: 'supervisor.wright@crimenet.demo',
      email: 'supervisor.wright@crimenet.demo',
      role: 'CASE_SUPERVISOR',
      clearance: 'Simulated Level-5',
      badge_id: 'SIM-BADGE-007'
    },
    {
      name: 'Command Admin',
      label: 'Demo System Administrator',
      id: 'admin@crimenet.demo',
      email: 'admin@crimenet.demo',
      role: 'SYSTEM_ADMIN',
      clearance: 'Simulated Level-5',
      badge_id: 'SIM-BADGE-999'
    }
  ]);

  const [selectedProfile, setSelectedProfile] = useState(quickProfiles[0]);

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

  const handleEnterWorkspace = async (profile = selectedProfile) => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      let loggedUser;
      if (auth && auth.demoLogin) {
        loggedUser = await auth.demoLogin(profile.email);
      } else {
        const res = await api.demoLogin(profile.email);
        loggedUser = res.user;
      }
      setAuthSuccess(true);
      if (onLoginSuccess && loggedUser) {
        setTimeout(() => onLoginSuccess(loggedUser), 400);
      }
    } catch (err) {
      console.error('Workspace demo launch error:', err);
      setErrorMsg(err.message || 'Simulation initialization failed.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#040711',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      color: '#e2e8f0',
      position: 'relative'
    }}>
      {/* Top Simulation Disclaimer Ribbon */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#7f1d1d',
        color: '#fef2f2',
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textAlign: 'center',
        padding: '6px 16px',
        borderBottom: '1px solid #991b1b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-mono, monospace)'
      }}>
        <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.58rem', padding: '1px 6px', borderRadius: '3px', fontWeight: 800 }}>
          DEMO ENVIRONMENT
        </span>
        <span>
          SIMULATION ONLY — ALL PEOPLE, INCIDENTS, LOCATIONS, IDENTITIES, IMAGES, AND EVIDENCE ARE FICTIONAL. NO REAL INVESTIGATIVE OR LAW-ENFORCEMENT DATA IS USED.
        </span>
      </div>

      <main style={{ width: '100%', maxWidth: '520px', marginTop: '30px' }}>
        {/* Main Card */}
        <div style={{
          backgroundColor: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.75)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              marginBottom: '14px',
              color: '#38bdf8'
            }}>
              <Shield size={26} strokeWidth={2.2} />
            </div>

            <h1 style={{
              margin: '0 0 6px 0',
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#f0f6fc',
              letterSpacing: '-0.01em'
            }}>
              CrimeNet AI — Synthetic Investigation Simulator
            </h1>

            <p style={{
              margin: 0,
              fontSize: '0.78rem',
              color: '#8b949e',
              lineHeight: 1.4
            }}>
              Autonomous Investigation & Graph Analytics Engine · Fictional Benchmark Evaluation
            </p>
          </div>

          {/* Explicit No Credentials Required Notice */}
          <div style={{
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Activity size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.73rem', color: '#93c5fd', lineHeight: 1.4 }}>
              <strong>Zero Credentials Required:</strong> This is an interactive evaluation demo. No passwords or real agency access credentials exist. Select an analytical persona below and enter the workspace directly.
            </div>
          </div>

          {/* Feedback Error Banner */}
          {errorMsg && (
            <div role="alert" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.78rem',
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
              backgroundColor: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: '#34d399',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              marginBottom: '18px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>DEMO WORKSPACE INITIALIZED. LAUNCHING INVESTIGATION SUITE...</span>
            </div>
          )}

          {/* Fictional Demo Role Selector */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.70rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#8b949e',
              marginBottom: '10px',
              textTransform: 'uppercase'
            }}>
              Select Simulated Persona / Demo Role:
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickProfiles.map(p => {
                const isSelected = selectedProfile.email === p.email;
                return (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => setSelectedProfile(p)}
                    disabled={isLoading || authSuccess}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#161b22',
                      border: `1px solid ${isSelected ? '#38bdf8' : '#30363d'}`,
                      borderRadius: '8px',
                      color: isSelected ? '#fff' : '#c9d1d9',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#38bdf8' : '#21262d',
                        color: isSelected ? '#000' : '#8b949e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.82rem'
                      }}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#38bdf8' : '#f0f6fc' }}>
                          {p.name} <span style={{ fontSize: '0.72rem', color: '#8b949e', fontWeight: 400 }}>({p.label})</span>
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#8b949e', fontFamily: 'var(--font-mono, monospace)', marginTop: '2px' }}>
                          Simulated Badge ID: <strong style={{ color: '#c9d1d9' }}>{p.badge_id}</strong> · {p.clearance}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                        color: '#040711',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button: Enter Demo Workspace */}
          <button
            id="enter-demo-workspace-btn"
            type="button"
            disabled={isLoading || authSuccess}
            onClick={() => handleEnterWorkspace(selectedProfile)}
            style={{
              width: '100%',
              padding: '13px 20px',
              backgroundColor: '#238636',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.90rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(35, 134, 54, 0.4)',
              transition: 'background-color 0.2s, transform 0.1s'
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={17} style={{ animation: 'spin 1s linear infinite' }} />
                <span>INITIALIZING SIMULATION...</span>
              </>
            ) : authSuccess ? (
              <>
                <CheckCircle2 size={17} />
                <span>ACCESS GRANTED — ENTERING WORKSPACE</span>
              </>
            ) : (
              <>
                <span>Enter Demo Workspace</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>

          {/* Footer simulation notice */}
          <div style={{
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: '1px solid #21262d',
            textAlign: 'center',
            fontSize: '0.68rem',
            color: '#8b949e',
            fontFamily: 'var(--font-mono, monospace)'
          }}>
            Smart India Hackathon (SIH) & Portfolio Synthetic Benchmark
          </div>
        </div>

        {/* Live Backend, Database & Graph Connectivity Telemetry */}
        <aside aria-label="System Connectivity Telemetry" style={{
          marginTop: '16px',
          backgroundColor: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.70rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            color: '#8b949e',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.65rem',
            fontWeight: 700
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={13} color="#38bdf8" />
              SYSTEM TELEMETRY
            </span>
            <span style={{ color: '#58a6ff' }}>{currentTimeUtc}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Database Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#161b22',
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid #21262d'
            }}>
              <Database size={14} color={connectivity.api_online ? '#34d399' : '#f87171'} />
              <div>
                <div style={{ color: '#f0f6fc', fontWeight: 600, fontSize: '0.68rem' }}>
                  Database & FIR Store
                </div>
                <div style={{ color: connectivity.api_online ? '#34d399' : '#f87171', fontSize: '0.62rem' }}>
                  {connectivity.api_online ? 'Connected (3 Cases · 60 Entities)' : 'OFFLINE'}
                </div>
              </div>
            </div>

            {/* NetworkX & RapidFuzz Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#161b22',
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid #21262d'
            }}>
              <Share2 size={14} color={connectivity.api_online ? '#34d399' : '#f87171'} />
              <div>
                <div style={{ color: '#f0f6fc', fontWeight: 600, fontSize: '0.68rem' }}>
                  AI Engine Pipelines
                </div>
                <div style={{ color: connectivity.api_online ? '#34d399' : '#f87171', fontSize: '0.62rem' }}>
                  {connectivity.api_online ? 'NetworkX + RapidFuzz Online' : 'OFFLINE'}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
