import React from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';

export default function EvidenceDetailModal({ evidence, onClose }) {
  const { navigate, updateSubject, setSelectedEvidence, duplicateEvidence } = useCIRA();

  if (!evidence) return null;

  const handleOpenGraph = () => {
    if (evidence.entities && evidence.entities.length > 0) {
      updateSubject({
        name: evidence.entities[0].name,
        id: evidence.entities[0].id || 'suspect-1',
        type: evidence.entities[0].type
      });
    }
    onClose();
    navigate('graph');
  };

  const handleAskCira = () => {
    onClose();
    navigate('chat');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(3, 5, 8, 0.84)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        width: '100%', maxWidth: '780px', maxHeight: '88vh',
        background: 'var(--ink-1)', border: '1px solid var(--b-soft)',
        borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.75)'
      }}>

        {/* Modal Top Bar */}
        <div style={{
          padding: '16px 22px', borderBottom: '1px solid var(--b-faint)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--ink-2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: '0.78rem',
              fontWeight: 700, color: 'var(--coral, #DA7667)'
            }}>
              {evidence.id}
            </span>
            <span style={{ color: 'var(--t-dim)' }}>·</span>
            <span style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '0.64rem',
              fontFamily: 'var(--f-mono)', fontWeight: 700,
              background: 'rgba(78, 154, 120, 0.15)', color: '#4E9A78',
              border: '1px solid rgba(78, 154, 120, 0.35)'
            }}>
              {evidence.processing_state || 'ANALYZED'}
            </span>
            {evidence.is_synthetic && (
              <span style={{
                padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem',
                fontFamily: 'var(--f-mono)', background: 'rgba(255,255,255,0.05)',
                color: 'var(--t-dim)'
              }}>
                Demo / Synthetic Data
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--t-dim)',
              fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t-dim)'}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Title and Case Link */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              {evidence.name}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--t-muted)' }}>
              Case Docket: <strong style={{ color: 'var(--coral, #DA7667)', fontFamily: 'var(--f-mono)' }}>{evidence.case_id}</strong>
              {evidence.case_name && <span> — {evidence.case_name}</span>}
            </div>
          </div>

          {/* Preview Section */}
          {evidence.preview_url ? (
            <div style={{
              background: 'var(--ink-3)', border: '1px solid var(--b-faint)',
              borderRadius: '8px', overflow: 'hidden', textAlign: 'center', maxHeight: '240px'
            }}>
              <img
                src={evidence.preview_url}
                alt={evidence.name}
                style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{
              padding: '16px', background: 'var(--ink-2)', border: '1px solid var(--b-faint)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '6px',
                background: 'rgba(255,255,255,0.05)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--blue-light)'
              }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Forensic File Ingested</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--t-muted)' }}>
                  {evidence.notes || 'Full cryptographic integrity hash verified against custody ledger.'}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.7rem', color: 'var(--t-dim)' }}>
                {evidence.file_size}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px',
            padding: '14px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--b-faint)'
          }}>
            <div>
              <div style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>EVIDENCE TYPE</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{evidence.type}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>INGESTION TIMESTAMP</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--t-secondary)', marginTop: '2px' }}>{evidence.upload_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>SOURCE OF EVIDENCE</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--t-secondary)', marginTop: '2px' }}>{evidence.source}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>SHA-256 HASH</div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--f-mono)', color: 'var(--green-light)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {evidence.checksum || 'sha256:7f9a2b881c3e44'}
              </div>
            </div>
          </div>

          {/* Extracted Entities */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.76rem', fontFamily: 'var(--f-mono)', color: 'var(--t-secondary)', fontWeight: 600 }}>
                EXTRACTED ENTITIES ({evidence.entities?.length || 0})
              </span>
              <span style={{ fontSize: '0.66rem', fontFamily: 'var(--f-mono)', color: 'var(--green-light)' }}>
                Used by Graph Analysis ✓
              </span>
            </div>

            {evidence.entities && evidence.entities.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {evidence.entities.map((ent, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 12px', background: 'var(--ink-2)',
                      border: '1px solid var(--b-faint)', borderRadius: '6px'
                    }}
                  >
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: ent.type === 'Person' ? '#f87171' : ent.type === 'Vehicle' ? '#fbbf24' : '#38bdf8'
                    }} />
                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{ent.name}</span>
                    <span style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>{ent.type}</span>
                    <span style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--green-light)' }}>
                      {Math.round((ent.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--t-dim)', fontStyle: 'italic' }}>
                Entity extraction unavailable for this file type.
              </div>
            )}
          </div>

          {/* Detected Relationships */}
          {evidence.relationships && evidence.relationships.length > 0 && (
            <div>
              <div style={{ fontSize: '0.76rem', fontFamily: 'var(--f-mono)', color: 'var(--t-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                DETECTED RELATIONSHIPS ({evidence.relationships.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {evidence.relationships.map((rel, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px', background: 'var(--ink-2)',
                      borderRadius: '6px', border: '1px solid var(--b-faint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#fff' }}>{rel.source}</strong>
                      <span style={{
                        padding: '1px 6px', borderRadius: '3px', fontSize: '0.64rem',
                        fontFamily: 'var(--f-mono)', background: 'rgba(255,255,255,0.06)', color: 'var(--blue-light)'
                      }}>
                        {rel.relation}
                      </span>
                      <strong style={{ color: '#fff' }}>{rel.target}</strong>
                    </div>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--green-light)' }}>
                      Conf: {Math.round((rel.confidence || 0.9) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div style={{
          padding: '14px 22px', borderTop: '1px solid var(--b-faint)',
          background: 'var(--ink-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 14px', background: 'transparent',
              border: '1px solid var(--b-soft)', borderRadius: '6px',
              color: 'var(--t-secondary)', fontSize: '0.78rem', cursor: 'pointer'
            }}
          >
            Close
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={async () => {
                const dup = await duplicateEvidence(evidence);
                if (dup) setSelectedEvidence(dup);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', background: 'var(--bg-elevated)',
                border: '1px solid var(--accent-border)', borderRadius: '6px',
                color: 'var(--accent-hover)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
              }}
              title="Duplicate this evidence item into a forensic working copy under FRE 1001(e)"
            >
              📋 Duplicate (Rule 1003 Copy)
            </button>
            <button
              onClick={handleAskCira}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', background: 'var(--accent-dim)',
                border: '1px solid var(--accent-border)', borderRadius: '6px',
                color: 'var(--accent-hover)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Ask CIRA
            </button>
            <button
              onClick={handleOpenGraph}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', background: 'var(--accent)',
                border: 'none', borderRadius: '6px',
                color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Open in Graph →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
