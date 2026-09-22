import React, { useState, useEffect } from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';
import { api } from '../services/api.js';
import EvidenceDetailModal from './EvidenceDetailModal.jsx';

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, badge }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: '8px', padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      transition: 'var(--transition-fast)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em' }}>
          {label}
        </span>
        {badge && (
          <span style={{
            fontSize: '0.66rem', fontFamily: 'var(--font-mono)', padding: '2px 8px',
            borderRadius: '4px', background: 'var(--bg-elevated)', color: color,
            border: '1px solid var(--border-default)', fontWeight: 600
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '1.9rem',
          fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em'
        }}>
          {value}
        </span>
      </div>
      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{sub}</span>
    </div>
  );
}

const STATUS_COLORS = {
  Active:         { bg: 'var(--success-dim)', color: 'var(--success)', border: 'var(--success-border)' },
  Critical:       { bg: 'var(--critical-dim)', color: 'var(--critical)', border: 'var(--critical-border)' },
  'Under Review': { bg: 'var(--warning-dim)', color: 'var(--warning)', border: 'var(--warning-border)' },
  Closed:         { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: 'var(--border-default)' },
};

export default function Dashboard({ currentUser, onSwitchPersona }) {
  const {
    cases,
    openCaseWorkspace,
    setIsCreateCaseOpen,
    selectedEvidence,
    setSelectedEvidence,
    navigate,
    duplicateCase
  } = useCIRA();

  const [recentEvidence, setRecentEvidence] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [allEvidenceCount, setAllEvidenceCount] = useState(0);

  useEffect(() => {
    const fetchRecentEvidence = async () => {
      try {
        const ev = await api.getEvidence();
        if (Array.isArray(ev)) {
          setRecentEvidence(ev.slice(0, 5));
          setAllEvidenceCount(ev.length);
        }
      } catch (e) {
        console.warn('Failed to load dashboard evidence', e);
      }
    };
    fetchRecentEvidence();
  }, []);

  // Compute operational stats from active user cases and loaded evidence
  const activeCasesCount = cases.filter(c => c.status === 'Active' || c.status === 'Critical').length;
  const criticalCasesCount = cases.filter(c => c.priority === 'Critical').length;
  const caseEvidenceSum = cases.reduce((acc, c) => acc + (c.evidence_count || (Array.isArray(c.evidence) ? c.evidence.length : 0)), 0);
  const totalEvidenceCount = allEvidenceCount > 0 ? allEvidenceCount : caseEvidenceSum;
  const totalEntitiesCount = cases.reduce((acc, c) => acc + (c.entity_count || (Array.isArray(c.entities) ? c.entities.length : 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Clean Executive Investigation Overview Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="dot dot-green" />
              <span style={{ fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
                COMMAND CENTER // ACTIVE INVESTIGATION DOCKETS
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Investigation Command & Relational Intelligence Summary
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0', maxWidth: '720px', lineHeight: 1.5 }}>
              Lead Investigator: <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.full_name || 'Special Agent Marcus Vance'}</strong> ({currentUser?.role || 'Senior Threat Analyst'}). Active priority case: <strong style={{ color: 'var(--accent-hover)' }}>Operation Sovereign</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onSwitchPersona && (
              <button
                onClick={onSwitchPersona}
                className="btn-secondary"
                style={{ fontSize: '0.76rem', padding: '7px 12px' }}
              >
                Switch Profile
              </button>
            )}

            <button
              onClick={() => setIsCreateCaseOpen(true)}
              className="btn-primary"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              + Create Case Docket
            </button>
          </div>
        </div>
      </div>

      {/* Tactical CCTV Surveillance & Geographic Investigation Map Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(51, 37, 41, 0.35) 100%)',
        border: '1px solid var(--border-burgundy)',
        borderLeft: '4px solid var(--accent)',
        borderRadius: '8px',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="dot dot-green" />
            <span style={{ fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-hover)', fontWeight: 700, letterSpacing: '0.06em' }}>
              PRIMARY CCTV SURVEILLANCE & GEOGRAPHIC TRACKING MATRIX
            </span>
            <span style={{
              fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '1px 6px',
              borderRadius: '3px', background: 'var(--coral-dim)', color: 'var(--coral)', border: '1px solid var(--coral-border)'
            }}>
              LIVE SENSOR MATRIX
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            CR-204 Sector 4 CCTV Surveillance Network (12 Active Cameras)
          </h3>
          <p style={{ margin: 0, fontSize: '0.80rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Geographic camera tracking for <strong>South Pier Logistics Depot</strong>. Inspect live camera telemetry, recorded sightings of <strong>Vehicle V-102</strong>, ArcFace-ResNet50 candidate match <strong>FM-042 (87% similarity)</strong> on CCTV-04, and incident <strong>INC-204</strong> alarm.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', background: 'var(--success-dim)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
              ✓ 12 CAMERAS ONLINE / MONITORED
            </span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', background: 'var(--accent-dim)', color: 'var(--accent-hover)', border: '1px solid var(--accent-border)' }}>
              🎯 87% BIOMETRIC REVIEW (FM-042)
            </span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', background: 'var(--warning-dim)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>
              🚚 INFERRED TRANSIT ROUTE (V-102)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('cr204')}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.284a2.25 2.25 0 00-2.006 0L2.622 5.72A1.125 1.125 0 002 6.727v11.454c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          <span>Launch CCTV Map & Live Cameras →</span>
        </button>
      </div>

      {/* Connected Case System Metrics */}
      <div style={{
        display: 'grid', gap: '14px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))'
      }}>
        <StatCard
          label="ACTIVE INVESTIGATION CASES"
          value={activeCasesCount}
          sub={`${cases.length} total dockets registered`}
          color="var(--accent-hover)"
          badge="DOCKETS"
        />
        <StatCard
          label="CRITICAL PRIORITY LEADS"
          value={criticalCasesCount}
          sub="Requires immediate investigator review"
          color="var(--coral)"
          badge="IMMEDIATE"
        />
        <StatCard
          label="EVIDENCE FILES INGESTED"
          value={totalEvidenceCount}
          sub="Chain of custody verified assets"
          color="var(--success)"
          badge="CUSTODY"
        />
        <StatCard
          label="RESOLVED NETWORK ENTITIES"
          value={totalEntitiesCount}
          sub="Indexed in criminal knowledge graph"
          color="var(--accent-hover)"
          badge="RELATIONAL"
        />
      </div>


      {/* Main Operational Split: Active Cases + Live Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>

        {/* Left: Active Cases Table */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '8px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid var(--border-default)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-elevated)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Active Case Dockets
              </span>
              <span className="badge badge-active" style={{ fontSize: '0.62rem' }}>
                {activeCasesCount} ACTIVE
              </span>
            </div>
            <button
              onClick={() => navigate('cases')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
            >
              View All Cases →
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                {['Case ID', 'Investigation Title', 'Status', 'Evidence', 'Lead Investigator', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Evidence' || h === 'Action' ? 'center' : 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cases.slice(0, 4).map((c) => {
                const sc = STATUS_COLORS[c.status] || STATUS_COLORS.Closed;
                return (
                  <tr
                    key={c.id}
                    onClick={() => openCaseWorkspace(c)}
                    style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}
                  >
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.74rem',
                        color: 'var(--accent)', fontWeight: 600
                      }}>
                        {c.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {c.title}
                      </div>
                      {c.primary_suspect && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 700 }}>🎯 Target:</span>
                          <span style={{ color: 'var(--text-primary)' }}>{c.primary_suspect}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                        {c.case_type} · Ref: {c.reference_no}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px',
                        borderRadius: '4px', fontSize: '0.64rem',
                        fontFamily: 'var(--font-mono)', fontWeight: 600,
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                      color: 'var(--text-primary)', textAlign: 'center', fontWeight: 600
                    }}>
                      {c.evidence_count || 0}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {c.investigator}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {c.id === 'CR-204' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('cr204');
                            }}
                            className="btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.68rem', borderColor: 'var(--accent)', color: 'var(--accent-hover)' }}
                            title="Open CR-204 CCTV Surveillance Map"
                          >
                            🗺️ CCTV Map
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateCase(c.id);
                          }}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.68rem', borderColor: 'var(--border-default)' }}
                          title="Duplicate Case Docket (Rule 1003 Working Copy)"
                        >
                          📋 Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCaseWorkspace(c);
                          }}
                          className="btn-secondary"
                          style={{ padding: '3px 10px', fontSize: '0.70rem' }}
                        >
                          Workspace →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Recent Ingested Evidence Stream */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid var(--border-default)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-elevated)'
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              Recent Evidence Intake
            </span>
            <button
              onClick={() => navigate('evidence')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Evidence Library →
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {recentEvidence.map((ev, idx) => (
              <div
                key={ev.id || idx}
                onClick={() => setSelectedEvidence(ev)}
                style={{
                  padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                      fontWeight: 600, color: 'var(--accent)'
                    }}>
                      {ev.id}
                    </span>
                    <span style={{
                      padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', color: 'var(--text-muted)'
                    }}>
                      {ev.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.80rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '3px' }}>
                    {ev.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {ev.case_id} · {ev.upload_date}
                  </div>
                </div>

                <span className="badge badge-active" style={{ fontSize: '0.62rem' }}>
                  {ev.processing_state || 'ANALYZED'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Priority Leads & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Priority Investigative Leads */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '8px', padding: '16px 20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="dot dot-amber" />
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Priority Investigative Leads
              </span>
            </div>
            <button
              onClick={() => navigate('leads')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Analyze Leads →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.80rem', color: 'var(--text-primary)' }}>🎯 Viktor Voronin & Darius Vance: Terminal C Escape Convoy</strong>
                <span className="badge badge-critical" style={{ fontSize: '0.64rem' }}>IMMEDIATE ACTION</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                ALPR Exit 14 hit confirmed: Vance piloting Black Escalade (8B9-CYP) alongside Marek Rostov lead Yukon. Telemetry cross-referenced with microwave tap.
              </p>
            </div>

            <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.80rem', color: 'var(--text-primary)' }}>🎯 Elena Rostov & Tariq Al-Mansoor: Escrow Mixer Laundering</strong>
                <span className="badge badge-warning" style={{ fontSize: '0.64rem' }}>ELEVATED RISK</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                140K USDT multi-sig escrow transfer via Tether wallet 0x889...F1C routed across 36 darknet mixer nodes by Tariq Al-Mansoor.
              </p>
            </div>

            <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.80rem', color: 'var(--text-primary)' }}>🎯 Viktor Chen (Cipher_Ghost): Tor Gateway Ransomware Ingress</strong>
                <span className="badge badge-critical" style={{ fontSize: '0.64rem' }}>CYBER THREAT</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Tor gateway IP 185.220 flagged delivering zero-day SCADA exploit payload under Chen keystroke fingerprint.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Investigation Activity */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '8px', padding: '16px 20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="dot dot-green" />
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Recent Investigation Activity
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              AUDIT LOG
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { time: '11:42 UTC', text: 'Voronin biometric match corroborated at Terminal C', case: 'CR-2026-0142' },
              { time: '09:50 UTC', text: 'ALPR vehicle hit: Plate 8B9-CYP detected exiting Sector 4', case: 'CR-2026-0142' },
              { time: '08:12 UTC', text: 'SCADA rail telemetry log ingested and linked to docket', case: 'CR-2026-0089' },
              { time: '06:15 UTC', text: 'FinCEN freeze request filed for wallet 0x889...F1C', case: 'CR-2026-0044' }
            ].map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.76rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.68rem', flexShrink: 0, marginTop: '2px' }}>
                  {act.time}
                </span>
                <div>
                  <span style={{ color: 'var(--text-primary)' }}>{act.text}</span>
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginLeft: '6px', fontSize: '0.66rem' }}>
                    [{act.case}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Selected Evidence Detail Modal */}
      {selectedEvidence && (
        <EvidenceDetailModal
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}

    </div>
  );
}
