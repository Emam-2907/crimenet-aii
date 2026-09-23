import React, { useState } from 'react';
import { soundFx } from '../utils/audio.js';
import { Shield, Volume2, VolumeX, UserCheck, LogIn, LogOut, Terminal, Activity } from 'lucide-react';

export default function Navbar({ onLaunchConsole, activeIncidentsCount, currentUser, onOpenAuth, onLogout }) {
  const [isMuted, setIsMuted] = useState(soundFx.isMuted);

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleNavClick = (tabId) => {
    soundFx.playTacticalClick();
    const el = document.getElementById('dashboard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    if (window.__switchDashboardTab) {
      window.__switchDashboardTab(tabId);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(10, 13, 20, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
    }}>
      {/* Top Defense Telemetry Header */}
      <div style={{
        background: '#070a10',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.74rem',
        padding: '5px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot pulse-dot-crimson"></span>
            <span style={{ color: '#fb7185', fontWeight: 600 }}>CONDITION: DEFCON 2 ELEVATED</span>
          </div>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>FUSION SENSORS:</span>
            <span style={{ color: 'var(--cyan-primary)' }}>84,210 LIVE NODES</span>
          </div>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>NODE:</span>
            <span style={{ color: 'var(--emerald-safe)' }}>US-EAST-METRO-01</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handleToggleSound}
            title={isMuted ? "Unmute Audio FX" : "Mute Audio FX"}
            style={{
              background: 'transparent',
              border: 'none',
              color: isMuted ? 'var(--text-muted)' : 'var(--cyan-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{isMuted ? "MUTED" : "AUDIO SFX"}</span>
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>FIPS 140-3 COMPLIANT</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px'
      }}>
        {/* Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#fff'
              }}>
                CRIMENET<span style={{ color: 'var(--cyan-primary)' }}>.AI</span>
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>ENTERPRISE DEFENSE</span>
            </div>
            <p style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: 'var(--font-mono)'
            }}>
              Cognitive Criminal Intelligence & Investigation System
            </p>
          </div>
        </div>

        {/* Quick Module Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px'
        }}>
          {[
            { id: 'nexus', label: 'Knowledge Graph' },
            { id: 'forensics', label: 'Face Match Lab' },
            { id: 'resolution', label: 'Entity Resolution' },
            { id: 'leads', label: 'Explainable Leads' },
            { id: 'threats', label: 'Incident Matrix' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.84rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--trans-smooth)',
                padding: '4px 2px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cyan-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Clearance Profile & Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: '7px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>
                  {currentUser.full_name || 'Special Agent Vance'}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--emerald-safe)', fontFamily: 'var(--font-mono)' }}>
                  CLEARANCE: {currentUser.clearance || 'TS/SCI-ORCON'}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="btn-ghost"
                style={{ padding: '5px 8px', fontSize: '0.72rem' }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-ghost"
              style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            >
              <LogIn size={14} />
              <span>Analyst Sign-In</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playTacticalClick();
              if (onLaunchConsole) onLaunchConsole();
              const el = document.getElementById('dashboard');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            <Terminal size={14} />
            <span>Tactical Command</span>
          </button>
        </div>
      </div>
    </header>
  );
}
