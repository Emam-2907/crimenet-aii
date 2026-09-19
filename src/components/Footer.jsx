import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: '#04060a',
      borderTop: '1px solid rgba(0, 240, 255, 0.12)',
      padding: '60px 0 30px 0',
      position: 'relative'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(168, 85, 247, 0.3))',
                border: '1px solid var(--cyan-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                CRIMENET<span style={{ color: 'var(--cyan-primary)' }}>.AI</span>
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Next-generation cognitive intelligence platform for public safety, cyber defense, and rapid threat interdiction.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              background: 'rgba(0, 255, 157, 0.1)',
              border: '1px solid rgba(0, 255, 157, 0.3)',
              borderRadius: '6px',
              fontSize: '0.72rem',
              color: 'var(--emerald-safe)',
              fontFamily: 'var(--font-mono)'
            }}>
              <span className="pulse-dot pulse-dot-emerald" style={{ width: '6px', height: '6px' }}></span>
              <span>GLOBAL SENSOR MESH NOMINAL</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h5 style={{ fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
              Core Systems
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><a href="#dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Live Threat Matrix</a></li>
              <li><a href="#tactical-map" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Geospatial Sector Radar</a></li>
              <li><a href="#nexus-graph" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Syndicate Nexus Graph</a></li>
              <li><a href="#forensic-lab" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Biometric & OCR Forensics</a></li>
              <li><a href="#capabilities" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Predictive Forecaster</a></li>
            </ul>
          </div>

          {/* Col 3: Security & Compliance */}
          <div>
            <h5 style={{ fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
              Security & Defense
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>FBI CJIS Security Policy v5.9</li>
              <li>NIST SP 800-53 Rev. 5 High</li>
              <li>Zero-Knowledge Proof Evidence</li>
              <li>Post-Quantum Cryptography</li>
              <li>Constitutional Privacy Engine</li>
            </ul>
          </div>

          {/* Col 4: Operations Hotline */}
          <div>
            <h5 style={{ fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
              Agency Command Hotline
            </h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              24/7 Priority Law Enforcement & Emergency Interdiction Operations Center:
            </p>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              color: 'var(--cyan-primary)',
              fontWeight: 700,
              marginBottom: '6px'
            }}>
              +1 (800) 555-CRIMENET
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SIP ENCRYPTED: ops@crimenet.ai
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; 2026 CrimeNet AI Technologies Inc. All rights reserved. CJIS / FedRAMP Certified.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            CONFIDENTIAL • LAW ENFORCEMENT & PUBLIC SAFETY OPERATIONAL INTERACTION ONLY
          </div>
        </div>
      </div>
    </footer>
  );
}
