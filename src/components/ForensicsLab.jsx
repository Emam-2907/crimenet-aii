import React, { useState } from 'react';
import { FORENSIC_CASES } from '../data/mockData.js';
import { soundFx } from '../utils/audio.js';

export default function ForensicsLab() {
  const [activeCase, setActiveCase] = useState(FORENSIC_CASES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(true);

  const handleSelectCase = (caseItem) => {
    soundFx.playTacticalClick();
    setActiveCase(caseItem);
    setIsScanning(false);
    setScanCompleted(true);
  };

  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanCompleted(false);
    soundFx.playScanSweep();

    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
      soundFx.playSuccessChime();
    }, 1600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Case Selection Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        padding: '6px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '10px',
        border: '1px solid var(--border-glass)'
      }}>
        {FORENSIC_CASES.map(c => (
          <button
            key={c.id}
            onClick={() => handleSelectCase(c)}
            style={{
              flex: '1 1 200px',
              background: activeCase.id === c.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              border: activeCase.id === c.id ? '1px solid var(--cyan-primary)' : '1px solid transparent',
              color: activeCase.id === c.id ? '#fff' : 'var(--text-secondary)',
              padding: '12px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              transition: 'var(--trans-smooth)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                {c.id}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                {c.name}
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--emerald-safe)', fontFamily: 'var(--font-mono)' }}>
              {c.confidence}
            </span>
          </button>
        ))}
      </div>

      {/* Main Analysis Screen */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 440px) 1fr',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Sample Frame & Laser Scanner */}
        <div className="glass-card" style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid var(--border-highlight)'
        }}>
          {/* Sample Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            overflow: 'hidden',
            backgroundColor: '#040711'
          }}>
            <img
              src={activeCase.sampleImage}
              alt={activeCase.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isScanning ? 'hue-rotate(90deg) contrast(1.2)' : 'none',
                transition: 'filter 0.3s ease'
              }}
            />

            {/* Target Reticle Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px',
              height: '180px',
              border: '1px dashed rgba(0, 240, 255, 0.6)',
              borderRadius: '8px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '12px', border: '2px solid #ff2a5f', borderRadius: '50%' }}></div>
            </div>

            {/* Scanning Laser Sweep */}
            {isScanning && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #00f0ff, #ffffff, #00f0ff, transparent)',
                boxShadow: '0 0 15px #00f0ff, 0 0 30px #00f0ff',
                animation: 'scanningLine 1.5s infinite linear'
              }}></div>
            )}

            {/* Top Corner Telemetry Badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(5, 7, 12, 0.85)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: '#00f0ff'
            }}>
              INPUT STREAM: 4K HIGH-DEF
            </div>
          </div>

          {/* Action Trigger Bar */}
          <div style={{ padding: '16px 20px', background: '#0a0f1d' }}>
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isScanning ? (
                <>
                  <span className="pulse-dot pulse-dot-crimson"></span>
                  <span>Neural Ingestion in Progress...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Re-Execute AI Neural Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Output & Breakdown */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-safe" style={{ marginBottom: '8px' }}>
                  {activeCase.subjectType}
                </span>
                <h3 style={{ fontSize: '1.4rem', margin: 0, color: '#fff' }}>
                  {activeCase.hitMatch}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-safe)', fontFamily: 'var(--font-heading)' }}>
                  {activeCase.confidence}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  CONFIDENCE SCORE
                </div>
              </div>
            </div>

            {/* Neural Speed & Keypoints telemetry */}
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '10px 16px',
              background: 'rgba(10, 16, 28, 0.8)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>INFERENCE LATENCY:</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)', marginLeft: '6px' }}>
                  {activeCase.latency}
                </span>
              </div>
              <span style={{ color: 'var(--text-dim)' }}>|</span>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ISOLATED KEYPOINTS:</span>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontFamily: 'var(--font-mono)', marginLeft: '6px' }}>
                  {activeCase.keypoints} Feature Vectors
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Extracted Biometric & Telemetry Vectors
              </div>

              {activeCase.metrics.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.84rem'
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                  <strong style={{ color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                    {m.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Hash Stamp */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)'
          }}>
            <span>SHA-256 HASH: 7F8E4D9C1A0...3B44</span>
            <span style={{ color: 'var(--emerald-safe)' }}>✓ CHAIN OF CUSTODY VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
