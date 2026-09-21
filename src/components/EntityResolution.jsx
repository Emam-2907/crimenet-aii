import React, { useState } from 'react';
import { api } from '../services/api.js';
import { soundFx } from '../utils/audio.js';
import {
  GitMerge, ShieldCheck, AlertCircle, Fingerprint,
  Phone, CreditCard, Car, Check, ChevronRight
} from 'lucide-react';

const RESOLUTION_CASES = [
  {
    id: 'ER-CASE-094',
    primaryName: 'Viktor Voronin',
    primaryId: 'suspect-1',
    threat: 'CRITICAL',
    currentAliases: ['Cypher-9', 'The Architect'],
    confidence: 0.945,
    status: 'PENDING_CONFIRMATION',
    dossierPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    candidates: [
      {
        aliasName: 'Ghost_0x',
        source: 'Darknet Wiretap & Tor Relay Log',
        matchScore: 0.97,
        evidencePoints: [
          'Matching PGP Public Key Fingerprint (*004D)',
          'Shared Burner Device ICCID (+1-800-DARK-91)',
          'Coinciding IP Packet Time-to-Live (TTL: 64)'
        ],
        icon: 'phone'
      },
      {
        aliasName: 'Victor V. (Kowloon Port Consignee)',
        source: 'Customs Import Bill of Lading #BG-8911',
        matchScore: 0.92,
        evidencePoints: [
          'Forged Bulgarian Consignment Documentation',
          'Biometric facial landmark ratio match (96.4%)',
          'Escrow beneficiary linked to wallet 0x889...F1C'
        ],
        icon: 'credit'
      }
    ],
    rationale: 'Cryptographic keystroke analysis and shared burner phone activity connect Ghost_0x and Victor V. directly to Viktor Voronin\'s verified operational profile.'
  },
  {
    id: 'ER-CASE-095',
    primaryName: 'Black SUV (VIN: 7829-K)',
    primaryId: 'veh-771',
    threat: 'HIGH',
    currentAliases: ['Unmarked Escalade'],
    confidence: 0.887,
    status: 'PENDING_CONFIRMATION',
    dossierPhoto: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=200&q=80',
    candidates: [
      {
        aliasName: 'Plate 8B9-CYP (Stolen Commercial Tag)',
        source: 'Automated License Plate Reader (ALPR)',
        matchScore: 0.89,
        evidencePoints: [
          'Chassis optical match (Cadillac Escalade Matte)',
          'Scratched rear left fender identified in CCTV',
          'Tag recorded at Harbor Gate 4 at 04:22 UTC'
        ],
        icon: 'car'
      }
    ],
    rationale: 'ALPR highway cameras captured vehicle swapping registration plates at highway exit 14 immediately following the Port Sovereign raid.'
  }
];

export default function EntityResolution() {
  const [cases, setCases] = useState(RESOLUTION_CASES);
  const [activeCase, setActiveCase] = useState(RESOLUTION_CASES[0]);
  const [mergedMap, setMergedMap] = useState({});
  const [mergeError, setMergeError] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    api.getEntityResolutionCases().then(res => {
      if (isMounted && res && res.cases && res.cases.length > 0) {
        setCases(res.cases);
        setActiveCase(res.cases[0]);
      }
    }).catch(err => {
      console.warn('Could not load live entity resolution cases:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const handleMerge = async (candidate) => {
    soundFx.playTacticalClick();
    setMergeError(null);
    setIsMerging(true);

    try {
      // Call backend API
      await api.mergeEntity(activeCase.id, activeCase.primaryId, candidate.aliasName, candidate.matchScore);

      setMergedMap(prev => ({
        ...prev,
        [`${activeCase.id}-${candidate.aliasName}`]: true
      }));

      // Update local state
      setCases(prev => prev.map(c => {
        if (c.id === activeCase.id) {
          return {
            ...c,
            currentAliases: [...c.currentAliases, candidate.aliasName],
            status: 'RESOLVED_VERIFIED'
          };
        }
        return c;
      }));

      setActiveCase(prev => ({
        ...prev,
        currentAliases: [...prev.currentAliases, candidate.aliasName],
        status: 'RESOLVED_VERIFIED'
      }));

      soundFx.playSuccessChime();
    } catch (err) {
      console.error('Merge entity error:', err);
      setMergeError(err.message || 'Entity merge failed. Check case authorization.');
      if (soundFx.playAlertBeep) soundFx.playAlertBeep();
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Overview Banner */}
      <div className="panel-card" style={{
        padding: '18px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'var(--bg-surface)',
        borderLeft: '3px solid var(--accent)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-info">
              ENTITY RESOLUTION ENGINE
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              DISAMBIGUATION & DEDUPLICATION
            </span>
          </div>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Cross-Jurisdiction Identity & Asset De-anonymization
          </h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Correlating fragmented identities across burner phones, fake registrations, and darknet handles into singular verified entities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            background: 'var(--bg-elevated)',
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border-default)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>OPEN DOCKETS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning)' }}>{cases.length}</div>
          </div>
          <div style={{
            background: 'var(--bg-elevated)',
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border-default)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONFIDENCE AVG</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
              {cases.length > 0
                ? `${Math.round((cases.reduce((acc, c) => acc + (c.confidence || 0.9), 0) / cases.length) * 100)}%`
                : '92%'}
            </div>
          </div>
        </div>
      </div>

      {mergeError && (
        <div role="alert" style={{
          padding: '10px 16px',
          background: 'var(--critical-dim)',
          border: '1px solid var(--critical-border)',
          color: 'var(--critical)',
          borderRadius: '6px',
          fontSize: '0.80rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{mergeError}</span>
        </div>
      )}

      {/* Main Resolution Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Left: Case Selection List */}
        <div className="panel-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingBottom: '6px', borderBottom: '1px solid var(--border-default)' }}>
            DISAMBIGUATION QUEUE
          </div>

          {cases.map(c => {
            const isSelected = activeCase.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  soundFx.playTacticalClick();
                  setActiveCase(c);
                }}
                style={{
                  background: isSelected ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  border: isSelected ? '1px solid var(--accent-border)' : '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.70rem', color: isSelected ? 'var(--accent-hover)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {c.id}
                  </span>
                  <span className={`badge ${c.status === 'RESOLVED_VERIFIED' ? 'badge-safe' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                    {c.status === 'RESOLVED_VERIFIED' ? 'RESOLVED' : 'PENDING'}
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.90rem' }}>
                  {c.primaryName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {c.candidates.length} Candidate Discrepancies
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Resolution File */}
        <div className="panel-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'var(--bg-surface)' }}>
          {/* Primary Subject Dossier Card */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            padding: '16px'
          }}>
            <img
              src={activeCase.dossierPhoto}
              alt={activeCase.primaryName}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1px solid var(--border-default)'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-critical">{activeCase.threat}</span>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  TARGET ID: {activeCase.primaryId}
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {activeCase.primaryName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified Aliases:</span>
                {activeCase.currentAliases.map((al, idx) => (
                  <span key={idx} className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                    {al}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONFIDENCE SCORE</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
                {Math.round(activeCase.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* Rationale brief */}
          <div style={{
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '0.80rem',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--accent-hover)' }}>INVESTIGATIVE RATIONALE:</strong> {activeCase.rationale}
          </div>

          {/* Candidate Matches */}
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GitMerge size={15} color="var(--accent)" />
              PROPOSED ENTITY MERGES FOR UNIFICATION
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeCase.candidates.map((cand, idx) => {
                const isMerged = mergedMap[`${activeCase.id}-${cand.aliasName}`];
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: isMerged ? '1px solid var(--success-border)' : '1px solid var(--border-default)',
                      borderRadius: '6px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          SOURCE: {cand.source}
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {cand.aliasName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>
                          {Math.round(cand.matchScore * 100)}% Match
                        </span>
                      </div>
                    </div>

                    {/* Evidence Points */}
                    <div style={{
                      background: 'var(--bg-surface)',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {cand.evidencePoints.map((pt, pIdx) => (
                        <div key={pIdx} style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--accent)' }}>•</span> {pt}
                        </div>
                      ))}
                    </div>

                    {/* Merge Action Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleMerge(cand)}
                        disabled={isMerged}
                        className={isMerged ? "btn-secondary" : "btn-primary"}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {isMerged ? (
                          <>
                            <Check size={13} style={{ color: 'var(--success)' }} /> Unified into Case Graph
                          </>
                        ) : (
                          <>
                            <GitMerge size={13} /> Verify & Merge Identity
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
