import React, { useState } from 'react';
import { soundFx } from '../utils/audio.js';

export default function IncidentModal({ incident, onClose, onDispatch }) {
  const [dispatchStatus, setDispatchStatus] = useState(incident?.status || 'PENDING');

  if (!incident) return null;

  const handleDispatch = () => {
    soundFx.playThreatAlert();
    setDispatchStatus('DISPATCHED');
    if (onDispatch) {
      onDispatch(incident.id);
    }
  };

  const isCritical = incident.severity === 'CRITICAL';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="panel-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative',
          background: 'var(--bg-surface)',
          border: `1px solid ${isCritical ? 'var(--danger-border)' : 'var(--border-default)'}`,
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            soundFx.playTacticalClick();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className={`badge ${isCritical ? 'badge-critical' : 'badge-info'}`}>
              {incident.severity} THREAT
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              FILE REF: {incident.id} // {incident.code}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              • {incident.timestamp}
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
            {incident.title}
          </h2>
        </div>

        {/* Suspect & Biometric Match Row */}
        {incident.suspect && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px 1fr',
            gap: '18px',
            padding: '16px',
            background: 'var(--bg-elevated)',
            borderRadius: '6px',
            border: '1px solid var(--border-default)',
            marginBottom: '20px'
          }}>
            {/* Suspect Photo Frame */}
            <div style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border-default)'
            }}>
              <img
                src={incident.suspect.avatar}
                alt={incident.suspect.alias}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(8, 11, 16, 0.9)',
                padding: '4px',
                textAlign: 'center',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--success)'
              }}>
                {incident.suspect.dnaMatch}
              </div>
            </div>

            {/* Suspect Profile Details */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                    {incident.suspect.alias}
                  </h4>
                  <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Legal Name: {incident.suspect.realName}
                  </p>
                </div>
                <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                  {incident.suspect.threatLevel}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.76rem',
                margin: '10px 0'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>PRIOR ARRESTS:</span>
                  <strong style={{ color: 'var(--text-primary)', marginLeft: '6px' }}>{incident.suspect.priorOffenses} Offenses</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>CCTV NODE:</span>
                  <strong style={{ color: 'var(--accent-hover)', marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>
                    {incident.cctvId}
                  </strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)' }}>LAST VECTOR:</span>
                  <span style={{ color: 'var(--text-primary)', marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>
                    {incident.suspect.lastKnownVector}
                  </span>
                </div>
              </div>

              {incident.suspect.associates.length > 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>KNOWN SYNDICATE LINKS: </span>
                  {incident.suspect.associates.map((assoc, idx) => (
                    <span
                      key={idx}
                      style={{
                        color: 'var(--warning)',
                        background: 'var(--warning-dim)',
                        border: '1px solid var(--warning-border)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        marginRight: '6px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {assoc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tactical Narrative */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '6px', fontWeight: 600 }}>
            TACTICAL INCIDENT LOG & INTELLIGENCE SUMMARY
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {incident.description}
          </p>
        </div>

        {/* Automated CAD Recommendation */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--danger-dim)',
          borderLeft: '3px solid var(--danger)',
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '0.70rem', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px' }}>
            CAD DISPATCH ADVISORY:
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0 }}>
            {incident.actionRecommendation}
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              soundFx.playTacticalClick();
              onClose();
            }}
            className="btn-secondary"
            style={{ fontSize: '0.80rem', padding: '8px 16px' }}
          >
            Close Dossier
          </button>

          <button
            onClick={handleDispatch}
            disabled={dispatchStatus === 'DISPATCHED'}
            className={dispatchStatus === 'DISPATCHED' ? 'btn-secondary' : 'btn-danger'}
            style={{ fontSize: '0.82rem', padding: '9px 20px' }}
          >
            {dispatchStatus === 'DISPATCHED' ? (
              <>
                <span className="status-indicator status-active"></span>
                <span>Interception Units Dispatched ✓</span>
              </>
            ) : (
              <>
                <span className="status-indicator status-critical"></span>
                <span>Authorize Tactical Intercept</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
