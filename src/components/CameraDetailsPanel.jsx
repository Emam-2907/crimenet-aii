import React, { useState } from 'react';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import { useCIRA } from '../context/CIRAContext.jsx';
import {
  Camera, MapPin, Clock, AlertTriangle, Shield, Check, X,
  ExternalLink, User, Truck, FileText, CheckCircle, HelpCircle,
  Eye, Info, GitFork, MessageSquare
} from 'lucide-react';

export default function CameraDetailsPanel() {
  const {
    selectedCamera,
    selectedFaceMatch,
    selectEntity,
    activeTimestamp
  } = useInvestigation();

  let navigate = null;
  try {
    const ciraCtx = useCIRA();
    navigate = ciraCtx?.navigate;
  } catch (e) {
    // optional fallback if rendered standalone
  }

  const [verificationStatus, setVerificationStatus] = useState(
    selectedFaceMatch?.human_review_status || 'PENDING_VERIFICATION'
  );
  const [auditMessage, setAuditMessage] = useState('');

  if (!selectedCamera) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <Camera size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
        <p style={{ margin: 0, fontSize: '0.85rem' }}>Select a camera marker on the map to inspect telemetry and events.</p>
      </div>
    );
  }

  const statusStyles = {
    ONLINE: { bg: 'var(--success-dim)', text: 'var(--success)', border: 'var(--success-border)' },
    WARNING: { bg: 'var(--warning-dim)', text: 'var(--warning)', border: 'var(--warning-border)' },
    MAINTENANCE: { bg: 'var(--warning-dim)', text: 'var(--warning)', border: 'var(--warning-border)' },
    OFFLINE: { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', border: 'var(--border-default)' }
  };
  const sc = statusStyles[selectedCamera.status] || statusStyles.ONLINE;

  const handleVerifyMatch = () => {
    setVerificationStatus('VERIFIED_BY_INVESTIGATOR');
    setAuditMessage('FM-042 verified by Special Agent Marcus Vance. Audit record appended.');
  };

  const handleRejectMatch = () => {
    setVerificationStatus('REJECTED_DISPROVED');
    setAuditMessage('FM-042 rejected. Visual inspection disproved match. Audit record appended.');
  };

  return (
    <aside className="camera-details-panel" aria-label="Camera Details and Surveillance Telemetry" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: '8px',
      padding: '16px',
      height: '100%',
      overflowY: 'auto'
    }}>

      {/* Header: Camera ID, Name, Status */}
      <div style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={18} color="var(--accent-hover)" />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.90rem',
              fontWeight: 800,
              color: 'var(--accent-hover)'
            }}>
              {selectedCamera.cameraId || selectedCamera.id}
            </span>
          </div>

          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: sc.bg,
            color: sc.text,
            border: `1px solid ${sc.border}`
          }}>
            {selectedCamera.status}
          </span>
        </div>

        <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {selectedCamera.name}
        </h3>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Location: <strong>{selectedCamera.location_name || selectedCamera.locationId}</strong>
        </div>

        {/* Telemetry and Coordinates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap' }}>
          <span>GPS: {selectedCamera?.lat != null ? Number(selectedCamera.lat).toFixed(4) : '40.7142'}°N, {selectedCamera?.lng != null ? Math.abs(Number(selectedCamera.lng)).toFixed(4) : '74.0062'}°W</span>
          <span>·</span>
          <span>{selectedCamera.resolution || '1080p Optical'}</span>
          <span>·</span>
          <span style={{ color: 'var(--accent-hover)' }}>~{selectedCamera.coverageRadius || 85}m Coverage</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => selectEntity(selectedCamera.id, 'camera')}
            style={{
              padding: '3px 8px',
              backgroundColor: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              borderRadius: '4px',
              color: 'var(--accent-hover)',
              fontSize: '0.66rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🗺️ Center on Map
          </button>
          {selectedCamera.events?.[0]?.entityId && (
            <button
              type="button"
              onClick={() => selectEntity(selectedCamera.events[0].entityId)}
              style={{
                padding: '3px 8px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '0.66rem',
                cursor: 'pointer'
              }}
            >
              🎯 Track {selectedCamera.events[0].entityId}
            </button>
          )}
          {navigate && (
            <>
              <button
                type="button"
                onClick={() => navigate('graph')}
                style={{
                  padding: '3px 8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--accent-hover)',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Inspect this camera and connected suspects in Graph Analysis"
              >
                📊 Graph Analysis
              </button>
              <button
                type="button"
                onClick={() => navigate('evidence')}
                style={{
                  padding: '3px 8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--success)',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="View verified evidence artifacts attached to this case"
              >
                📋 Case Evidence
              </button>
              <button
                type="button"
                onClick={() => navigate('chat')}
                style={{
                  padding: '3px 8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Query CIRA AI assistant about this camera's sightings"
              >
                🤖 Query CIRA
              </button>
            </>
          )}
        </div>
      </div>

      {/* Synthetic CCTV Preview with Unremovable Watermark */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            SURVEILLANCE FEED PREVIEW
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
            {activeTimestamp} UTC
          </span>
        </div>

        <div style={{
          position: 'relative',
          height: '190px',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          backgroundColor: '#000'
        }}>
          <img
            src={selectedCamera.frame_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"}
            alt={`Surveillance frame from ${selectedCamera.id}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
          />

          {/* Unremovable Synthetic Watermark */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'rgba(8, 10, 13, 0.92)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            fontSize: '0.62rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '3px',
            letterSpacing: '0.04em'
          }}>
            DEMO FEED — SYNTHETIC SURVEILLANCE
          </div>

          {/* Reticle for FM-042 if viewing CCTV-04 */}
          {selectedCamera.id === 'CCTV-04' && (
            <div style={{
              position: 'absolute',
              top: '31%',
              left: '42%',
              width: '24%',
              height: '32%',
              border: '1.5px solid var(--accent-hover)',
              pointerEvents: 'none'
            }}>
              <span style={{
                position: 'absolute',
                top: '-18px',
                left: '0',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--accent-hover)',
                fontSize: '0.58rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '1px 4px',
                borderRadius: '2px',
                whiteSpace: 'nowrap'
              }}>
                FM-042 (87% SIMILARITY)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Camera Coverage Notice */}
      <div style={{
        backgroundColor: 'var(--accent-dim)',
        border: '1px solid var(--accent-border)',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '0.70rem',
        color: 'var(--accent-hover)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
          <Eye size={12} />
          <span>SIMULATED CAMERA COVERAGE</span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.66rem' }}>
          Radius: ~{selectedCamera.coverageRadius || 85}m. This is an approximate simulated model and must NOT be presented as an exact real-world surveillance boundary.
        </div>
      </div>

      {/* Recent Events List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Clock size={14} color="var(--warning)" />
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            RECENT CAMERA EVENTS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {selectedCamera.events && selectedCamera.events.length > 0 ? (
            selectedCamera.events.map((evt, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px'
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--warning)',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  flexShrink: 0
                }}>
                  {evt.time}
                </span>
                <span style={{ color: 'var(--text-primary)', flex: 1 }}>
                  {evt.title}
                </span>
                {evt.entityId && (
                  <button
                    type="button"
                    onClick={() => selectEntity(evt.entityId)}
                    style={{
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent-hover)',
                      borderRadius: '3px',
                      padding: '1px 5px',
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer'
                    }}
                  >
                    {evt.entityId}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No recent high-priority event telemetry recorded for this node.
            </div>
          )}
        </div>
      </div>

      {/* Related Entities */}
      <div>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
          RELATED ENTITIES
        </span>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {selectedCamera.id === 'CCTV-04' ? (
            ['P-017', 'V-102', 'FM-042', 'CR-204', 'INC-204'].map(entId => (
              <button
                key={entId}
                type="button"
                onClick={() => selectEntity(entId)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--accent-hover)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {entId}
              </button>
            ))
          ) : (
            [
              ...(selectedCamera.relatedPersons || []),
              ...(selectedCamera.relatedVehicles || []),
              ...(selectedCamera.relatedFaceMatches || []),
              ...(selectedCamera.relatedIncidents || []),
              ...(selectedCamera.caseIds || [])
            ].map(entId => (
              <button
                key={entId}
                type="button"
                onClick={() => selectEntity(entId)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--accent-hover)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {entId}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Evidence Association */}
      <div style={{
        padding: '10px 12px',
        backgroundColor: 'var(--bg-main)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <FileText size={14} color="var(--accent-hover)" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ASSOCIATED EVIDENCE
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--accent-hover)' }}>
          {selectedCamera.evidence_id || 'EVID-CCTV-04'}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Archived in Sector 4 Intelligence Vault. Chain of custody verified.
        </div>
      </div>

      {/* Biometric Verification Module if FM-042 is relevant */}
      {(selectedCamera.id === 'CCTV-04' || selectedCamera.relatedFaceMatches?.includes('FM-042')) && (
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--warning-dim)',
          border: '1px solid var(--warning-border)',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--warning)' }}>
              BIOMETRIC CANDIDATE: FM-042
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontFamily: 'var(--font-mono)',
              padding: '1px 6px',
              borderRadius: '3px',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--warning)',
              border: '1px solid var(--warning-border)'
            }}>
              87% MODEL SIMILARITY
            </span>
          </div>

          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            <strong>Truthfulness Disclosure:</strong> Candidate match generated by ArcFace-ResNet50 v2.4. Human verification required before tactical action. Never treat similarity as confirmed identity.
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleVerifyMatch}
              disabled={verificationStatus === 'VERIFIED_BY_INVESTIGATOR'}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: 'var(--success)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.70rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Check size={12} />
              <span>Verify Match</span>
            </button>
            <button
              type="button"
              onClick={handleRejectMatch}
              disabled={verificationStatus === 'REJECTED_DISPROVED'}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: 'var(--critical-dim)',
                color: 'var(--critical)',
                border: '1px solid var(--critical-border)',
                borderRadius: '4px',
                fontSize: '0.70rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <X size={12} />
              <span>Reject Match</span>
            </button>
          </div>

          {auditMessage && (
            <div style={{ fontSize: '0.66rem', color: 'var(--success)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
              ✓ {auditMessage}
            </div>
          )}
        </div>
      )}

    </aside>
  );
}
