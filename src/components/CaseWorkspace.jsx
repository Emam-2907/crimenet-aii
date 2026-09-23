import React, { useState, useEffect } from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';
import { api } from '../services/api.js';
import EvidenceExplorer from './EvidenceExplorer.jsx';
import EvidenceDetailModal from './EvidenceDetailModal.jsx';
import ForensicFaceLab from './ForensicFaceLab.jsx';
import CR204InvestigationView from './CR204InvestigationView.jsx';

const TABS = [
  { id: 'OVERVIEW',          label: 'Overview' },
  { id: 'CCTV_MAP',          label: '🗺️ CCTV & Map' },
  { id: 'EVIDENCE',          label: 'Evidence' },
  { id: 'FACE_INTELLIGENCE', label: 'Face Intelligence' },
  { id: 'ENTITIES',          label: 'Entities' },
  { id: 'RELATIONSHIPS',     label: 'Relationships' },
  { id: 'TIMELINE',          label: 'Timeline' },
  { id: 'ACTIVITY',          label: 'Activity' }
];

export default function CaseWorkspace() {
  const {
    activeCase,
    setActiveCase,
    activeCaseTab,
    setActiveCaseTab,
    navigate,
    updateSubject,
    selectedEvidence,
    setSelectedEvidence,
    duplicateCase
  } = useCIRA();

  const [caseDetail, setCaseDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState('Person');
  const [newEntityThreat, setNewEntityThreat] = useState('HIGH');

  // Load detailed case data
  const loadCaseData = async () => {
    if (!activeCase?.id) return;
    setLoading(true);
    try {
      const data = await api.getCase(activeCase.id);
      setCaseDetail(data);
    } catch (e) {
      console.warn('Failed to load case detail', e);
      setCaseDetail(activeCase);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [activeCase?.id]);

  const current = caseDetail || activeCase;

  if (!current) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3 style={{ color: '#fff' }}>No Active Case Selected</h3>
        <p style={{ color: 'var(--t-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
          Select an investigation from the Cases registry to enter its dedicated workspace.
        </p>
        <button
          onClick={() => navigate('cases')}
          style={{
            marginTop: '14px', padding: '8px 18px', background: 'var(--green)',
            border: 'none', borderRadius: '6px', color: '#06090e', fontWeight: 700, cursor: 'pointer'
          }}
        >
          View Cases Docket →
        </button>
      </div>
    );
  }

  const handleOpenGraph = () => {
    if (current.entities && current.entities.length > 0) {
      updateSubject({
        name: current.entities[0].name,
        id: current.entities[0].id || 'suspect-1',
        type: current.entities[0].type
      });
    }
    navigate('graph');
  };

  const handleAskCira = () => {
    navigate('chat');
  };

  const handleAddCustomEntity = (e) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;

    const newEnt = {
      id: `ent-custom-${Date.now()}`,
      name: newEntityName.trim(),
      type: newEntityType,
      confidence: 0.95,
      threat: newEntityThreat
    };

    setCaseDetail(prev => ({
      ...prev,
      entities: [newEnt, ...(prev.entities || [])],
      entity_count: (prev.entity_count || 0) + 1
    }));

    setNewEntityName('');
    setShowAddEntityModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Main Case Header Card */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: '8px', padding: '20px 24px', display: 'flex',
        flexDirection: 'column', gap: '14px'
      }}>

        {/* Top Badges & Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.84rem',
              fontWeight: 700, color: 'var(--accent)',
              padding: '2px 8px', background: 'var(--accent-dim)',
              borderRadius: '4px', border: '1px solid var(--accent-border)'
            }}>
              {current.id}
            </span>
            <span className={current.status === 'Active' ? 'badge badge-active' : 'badge badge-critical'}>
              {current.status}
            </span>
            <span style={{
              fontSize: '0.74rem', fontFamily: 'var(--font-mono)',
              color: current.priority === 'Critical' ? '#C04A52' : '#B58A45',
              fontWeight: 600
            }}>
              ● {current.priority} Priority
            </span>
            <span style={{ fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Ref: {current.reference_no}
            </span>
          </div>

          <button
            onClick={() => navigate('cases')}
            className="btn-secondary"
            style={{ fontSize: '0.74rem', padding: '5px 12px' }}
          >
            ← Switch Docket
          </button>
        </div>

        {/* Title, Scope & Primary Target */}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.4rem',
            fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: '6px'
          }}>
            {current.title}
          </h2>
          {current.primary_suspect && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '4px 12px', background: 'rgba(155, 61, 69, 0.15)',
              border: '1px solid rgba(155, 61, 69, 0.35)', borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: '#9B3D45', fontWeight: 700 }}>
                🎯 PRIMARY CRIMINAL TARGET:
              </span>
              <strong style={{ fontSize: '0.84rem', color: '#fff', letterSpacing: '0.02em' }}>
                {current.primary_suspect}
              </strong>
            </div>
          )}
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '850px' }}>
            {current.description || 'Active synchronized investigation tracking contraband, digital forensics, and suspect infrastructure.'}
          </p>
        </div>

        {/* Meta details bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
          paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.74rem', color: 'var(--text-secondary)'
        }}>
          <div>
            Lead: <strong style={{ color: 'var(--text-primary)' }}>{current.investigator}</strong>
          </div>
          <div>
            Type: <strong style={{ color: 'var(--accent)' }}>{current.case_type}</strong>
          </div>
          <div>
            Evidence: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{current.evidence_count || current.evidence?.length || 0}</strong>
          </div>
          <div>
            Entities: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{current.entity_count || current.entities?.length || 0}</strong>
          </div>
          <div>
            Last Updated: <span style={{ fontFamily: 'var(--font-mono)' }}>{current.last_updated}</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <button
            onClick={() => setActiveCaseTab('CCTV_MAP')}
            className="btn-primary"
            style={{ fontSize: '0.78rem', padding: '7px 14px' }}
          >
            🗺️ CCTV Surveillance Map
          </button>

          <button
            onClick={() => duplicateCase(current.id)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '7px 14px', borderColor: 'var(--accent)', color: 'var(--accent-hover)' }}
            title="Create an authentic forensic working duplicate of this case docket"
          >
            📋 Duplicate Case Docket
          </button>

          <button
            onClick={() => {
              setActiveCaseTab('EVIDENCE');
              setShowUploader(true);
            }}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '7px 14px' }}
          >
            + Upload Evidence
          </button>

          <button
            onClick={() => setShowAddEntityModal(true)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '7px 14px' }}
          >
            + Add Entity
          </button>

          <button
            onClick={handleOpenGraph}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '7px 14px', color: 'var(--accent)' }}
          >
            Open Graph →
          </button>

          <button
            onClick={handleAskCira}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '7px 14px' }}
          >
            Query Intel Dossier
          </button>

          <button
            onClick={() => navigate('graph')}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '7px 14px' }}
          >
            Network Threat Radar
          </button>
        </div>

      </div>

      {/* Main Tabbed Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', gap: '4px' }}>
        {TABS.map(tab => {
          const isActive = activeCaseTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCaseTab(tab.id)}
              style={{
                padding: '10px 16px', border: 'none', cursor: 'pointer',
                background: 'transparent',
                borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.82rem', fontWeight: isActive ? 600 : 500,
                transition: 'var(--transition-fast)'
              }}
            >
              {tab.label}
              {tab.id === 'EVIDENCE' && (
                <span style={{ marginLeft: '6px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                  ({current.evidence?.length || current.evidence_count || 0})
                </span>
              )}
              {tab.id === 'ENTITIES' && (
                <span style={{ marginLeft: '6px', fontSize: '0.68rem', fontFamily: 'var(--f-mono)', color: isActive ? 'var(--green-light)' : 'var(--t-dim)' }}>
                  ({current.entities?.length || current.entity_count || 0})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      {activeCaseTab === 'OVERVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Scope Summary Box */}
            <div style={{ background: 'var(--ink-1)', border: '1px solid var(--b-faint)', borderRadius: '10px', padding: '18px 20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                Operational Scope & Jurisdictional Directive
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--t-secondary)', lineHeight: 1.6 }}>
                {current.description || 'Investigation active under federal counter-syndicate authority.'}
              </p>

              {current.tags && current.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                  {current.tags.map(t => (
                    <span key={t} style={{
                      padding: '3px 9px', borderRadius: '4px', fontSize: '0.68rem',
                      fontFamily: 'var(--f-mono)', background: 'rgba(255,255,255,0.05)',
                      color: 'var(--t-secondary)', border: '1px solid var(--b-faint)'
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CCTV Tactical Surveillance Banner in Case Overview */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 132, 199, 0.16) 100%)',
              border: '1.5px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 800, letterSpacing: '0.04em' }}>
                    SECTOR 4 GEOGRAPHIC CCTV NETWORK
                  </span>
                </div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#fff' }}>
                  12 Active CCTV Surveillance Cameras Monitored
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Interactive geographic tracking: Vehicle V-102 route, ArcFace 87% candidate match FM-042, and live camera telemetry.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveCaseTab('CCTV_MAP')}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '8px 16px', backgroundColor: '#0284c7', borderColor: '#38bdf8' }}
              >
                Launch CCTV Map Tab →
              </button>
            </div>

            {/* Key Subjects Preview */}
            <div style={{ background: 'var(--ink-1)', border: '1px solid var(--b-faint)', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                  Primary Target Entities ({current.entities?.length || 0})
                </h4>
                <button
                  onClick={() => setActiveCaseTab('ENTITIES')}
                  style={{ background: 'none', border: 'none', color: 'var(--green-light)', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  View All Entities →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {(current.entities || []).slice(0, 4).map((ent, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px', background: 'var(--ink-2)',
                      border: '1px solid var(--b-faint)', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>{ent.name}</div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>{ent.type}</div>
                    </div>
                    <span style={{
                      fontSize: '0.64rem', fontFamily: 'var(--f-mono)',
                      color: ent.threat === 'CRITICAL' ? 'var(--red-light)' : 'var(--amber-light)'
                    }}>
                      {ent.threat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Case Timeline Preview */}
          <div style={{
            background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
            borderRadius: '10px', padding: '18px 20px', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                Recent Case Timeline
              </h4>
              <button
                onClick={() => setActiveCaseTab('TIMELINE')}
                style={{ background: 'none', border: 'none', color: 'var(--green-light)', fontSize: '0.74rem', cursor: 'pointer' }}
              >
                Full Log →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(current.timeline || []).slice(-5).reverse().map((t, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--green-light)', marginTop: '5px', flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#fff', lineHeight: 1.35 }}>{t.event}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', marginTop: '2px' }}>
                      {t.date} · {t.author}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CCTV & MAP ─────────────────────────────────────────────────── */}
      {activeCaseTab === 'CCTV_MAP' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="dot dot-green" />
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-hover)', fontWeight: 700 }}>
                  PRIMARY CCTV SURVEILLANCE & GEOGRAPHIC TRACKING MATRIX
                </span>
                <span style={{
                  fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '1px 6px',
                  borderRadius: '3px', background: 'var(--critical-dim)', color: 'var(--critical)', border: '1px solid var(--critical-border)'
                }}>
                  SECTOR 4
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                CR-204 CCTV Surveillance Network & Sighting Telemetry
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                12 active CCTV surveillance cameras monitored across South Pier Logistics Depot. Tracking Vehicle V-102 transit route, candidate match FM-042 (87% ArcFace similarity), and incident INC-204 alarm.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('cr204')}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Launch Original Tactical Map →</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>MONITORED CAMERAS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>12 Active Units</div>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', marginTop: '2px' }}>CCTV-01 to CCTV-12</div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>PRIMARY SIGHTING</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-hover)', marginTop: '4px' }}>Gate 4 Turnstile</div>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', marginTop: '2px' }}>FM-042 (87% Biometric Match)</div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>TRANSIT CORRIDOR</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)', marginTop: '4px' }}>Vehicle V-102</div>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', marginTop: '2px' }}>Inferred Pier East Route</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: EVIDENCE ─────────────────────────────────────────────────── */}
      {activeCaseTab === 'EVIDENCE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Toggle Uploader */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--t-secondary)', fontWeight: 600 }}>
              Evidence Associated with {current.id} ({current.evidence?.length || 0})
            </span>
            <button
              onClick={() => setShowUploader(!showUploader)}
              style={{
                padding: '6px 14px', background: showUploader ? 'var(--ink-2)' : 'var(--green-dim)',
                border: `1px solid ${showUploader ? 'var(--b-soft)' : 'var(--green-border)'}`,
                borderRadius: '6px', color: showUploader ? 'var(--t-secondary)' : 'var(--green-light)',
                fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {showUploader ? 'Hide Upload Dropzone ▲' : '+ Open Upload Dropzone ▼'}
            </button>
          </div>

          {showUploader && (
            <EvidenceExplorer
              caseId={current.id}
              onEvidenceUploaded={(newEv) => {
                setCaseDetail(prev => ({
                  ...prev,
                  evidence: [newEv, ...(prev.evidence || [])],
                  evidence_count: (prev.evidence_count || 0) + 1
                }));
              }}
            />
          )}

          {/* Evidence Table */}
          {(!current.evidence || current.evidence.length === 0) ? (
            <div style={{
              padding: '40px 20px', background: 'var(--ink-1)', border: '1px dashed var(--b-soft)',
              borderRadius: '10px', textAlign: 'center'
            }}>
              <p style={{ color: 'var(--t-muted)', fontSize: '0.84rem' }}>
                No evidence items attached to this case yet. Use the upload dropzone above to ingest files.
              </p>
            </div>
          ) : (
            <div style={{
              background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
              borderRadius: '10px', overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--b-faint)', background: 'var(--ink-2)' }}>
                    {['Evidence ID', 'Artifact Name', 'Type', 'Upload Date', 'Source', 'State', 'Entities', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '10px 16px', fontSize: '0.68rem', fontFamily: 'var(--f-mono)',
                        color: 'var(--t-dim)', letterSpacing: '0.06em', textTransform: 'uppercase'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {current.evidence.map((ev, idx) => (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEvidence(ev)}
                      style={{
                        borderBottom: idx < current.evidence.length - 1 ? '1px solid var(--b-faint)' : 'none',
                        cursor: 'pointer', transition: 'var(--ease)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--f-mono)', fontSize: '0.76rem', color: 'var(--blue-light)', fontWeight: 700 }}>
                        {ev.id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600 }}>{ev.name}</div>
                        <div style={{ fontSize: '0.66rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>{ev.file_size}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.66rem',
                          background: 'rgba(255,255,255,0.05)', color: 'var(--t-secondary)', fontFamily: 'var(--f-mono)'
                        }}>
                          {ev.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.76rem', color: 'var(--t-muted)' }}>
                        {ev.upload_date}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--t-secondary)' }}>
                        {ev.source}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 7px', borderRadius: '4px', fontSize: '0.64rem',
                          fontFamily: 'var(--f-mono)', fontWeight: 700,
                          background: 'rgba(0, 200, 122, 0.12)', color: 'var(--green-light)',
                          border: '1px solid rgba(0, 200, 122, 0.3)'
                        }}>
                          {ev.processing_state || 'ANALYZED'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--f-mono)', fontSize: '0.8rem', color: 'var(--blue-light)', fontWeight: 700 }}>
                        {ev.extracted_entities_count || ev.entities?.length || 0}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvidence(ev);
                          }}
                          style={{
                            padding: '4px 10px', background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--b-soft)', borderRadius: '4px',
                            color: '#fff', fontSize: '0.7rem', cursor: 'pointer'
                          }}
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ENTITIES ─────────────────────────────────────────────────── */}
      {activeCaseTab === 'ENTITIES' && (
        <div style={{
          background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
          borderRadius: '10px', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--b-faint)', background: 'var(--ink-2)' }}>
                {['Entity Identifier', 'Classification', 'Threat Level', 'Extraction Confidence', 'Graph Status'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', fontSize: '0.68rem', fontFamily: 'var(--f-mono)',
                    color: 'var(--t-dim)', letterSpacing: '0.06em', textTransform: 'uppercase'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(current.entities || []).map((ent, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx < (current.entities?.length || 0) - 1 ? '1px solid var(--b-faint)' : 'none',
                    transition: 'var(--ease)'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>{ent.name}</div>
                    <div style={{ fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>{ent.id || `ent-${idx+1}`}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.66rem',
                      background: 'rgba(255,255,255,0.06)', color: 'var(--blue-light)', fontFamily: 'var(--f-mono)'
                    }}>
                      {ent.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.64rem',
                      fontFamily: 'var(--f-mono)', fontWeight: 700,
                      background: ent.threat === 'CRITICAL' ? 'rgba(255,42,95,0.15)' : 'rgba(217,119,6,0.12)',
                      color: ent.threat === 'CRITICAL' ? 'var(--red-light)' : 'var(--amber-light)',
                      border: `1px solid ${ent.threat === 'CRITICAL' ? 'rgba(255,42,95,0.3)' : 'rgba(217,119,6,0.3)'}`
                    }}>
                      {ent.threat || 'HIGH'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--f-mono)', fontSize: '0.78rem', color: 'var(--green-light)', fontWeight: 600 }}>
                    {Math.round((ent.confidence || 0.94) * 100)}%
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.74rem', color: 'var(--t-muted)' }}>
                    Linked in Graph Matrix ✓
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 4: RELATIONSHIPS ────────────────────────────────────────────── */}
      {activeCaseTab === 'RELATIONSHIPS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px 16px', background: 'var(--ink-1)', border: '1px solid var(--b-soft)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                Relational Knowledge Graph — {current.id}
              </div>
              <div style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', marginTop: '2px' }}>
                {current.relationships?.length || 0} Evidence-backed semantic links mapped in Neo4j database
              </div>
            </div>
            <button
              onClick={handleOpenGraph}
              style={{
                padding: '7px 14px', background: 'var(--green)', border: 'none',
                borderRadius: '6px', color: '#06090e', fontWeight: 700, fontSize: '0.76rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span>Open Interactive Graph Console</span>
              <span style={{ fontSize: '0.85rem' }}>→</span>
            </button>
          </div>

          <div style={{
            background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
            borderRadius: '10px', overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--b-faint)', background: 'var(--ink-2)' }}>
                {['Source Entity', 'Semantic Relationship', 'Target Entity', 'Confidence', 'Graph Link'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', fontSize: '0.68rem', fontFamily: 'var(--f-mono)',
                    color: 'var(--t-dim)', letterSpacing: '0.06em', textTransform: 'uppercase'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(current.relationships || []).map((rel, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx < (current.relationships?.length || 0) - 1 ? '1px solid var(--b-faint)' : 'none'
                  }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>
                    {rel.source}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.66rem',
                      fontFamily: 'var(--f-mono)', background: 'rgba(56, 189, 248, 0.1)',
                      color: 'var(--blue-light)', border: '1px solid rgba(56, 189, 248, 0.25)'
                    }}>
                      {rel.relation}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>
                    {rel.target}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--f-mono)', fontSize: '0.78rem', color: 'var(--green-light)' }}>
                    {Math.round((rel.confidence || 0.9) * 100)}%
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={handleOpenGraph}
                      style={{
                        padding: '3px 8px', background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--b-soft)', borderRadius: '4px',
                        color: '#fff', fontSize: '0.68rem', cursor: 'pointer'
                      }}
                    >
                      Inspect in Graph →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ── TAB 5: TIMELINE ─────────────────────────────────────────────────── */}
      {activeCaseTab === 'TIMELINE' && (
        <div style={{
          background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
          borderRadius: '10px', padding: '22px'
        }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Authenticated Chronological Timeline — {current.id}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--b-faint)' }}>
            {(current.timeline || []).map((event, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '-21px', top: '4px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'var(--green-light)', boxShadow: '0 0 6px var(--green)'
                }} />
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                  {event.event}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', marginTop: '3px' }}>
                  {event.date} · Logged by: {event.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: ACTIVITY ─────────────────────────────────────────────────── */}
      {activeCaseTab === 'ACTIVITY' && (
        <div style={{
          background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
          borderRadius: '10px', padding: '20px'
        }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
            Audit Trail & User Telemetry
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { time: '11:42 UTC', user: 'Special Agent Marcus Vance', action: 'Requested CIRA AI Hypothesis generation' },
              { time: '09:50 UTC', user: 'Automated ALPR Ingestion Hook', action: 'Added ALPR plate hit EV-0189' },
              { time: '05:10 UTC', user: 'Forensic Face Lab Engine', action: 'Biometric landmark match Viktor Voronin (96.4%)' },
              { time: '03:22 UTC', user: 'Customs Intercept Cell', action: 'Uploaded Call_Record_Microwave_Tap.csv' }
            ].map((log, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px', background: 'var(--ink-2)',
                  borderRadius: '6px', border: '1px solid var(--b-faint)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem'
                }}
              >
                <div>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{log.user}</span>: {log.action}
                </div>
                <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--t-dim)', fontSize: '0.7rem' }}>
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: FACE INTELLIGENCE ─────────────────────────────────────────── */}
      {activeCaseTab === 'FACE_INTELLIGENCE' && (
        <div style={{ marginTop: '8px' }}>
          <ForensicFaceLab caseId={current.id} />
        </div>
      )}

      {/* Add Entity Modal */}
      {showAddEntityModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(3, 5, 8, 0.82)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '440px', background: 'var(--ink-1)',
            border: '1px solid var(--b-soft)', borderRadius: '10px', padding: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
              Add Subject or Asset to Case
            </h3>
            <form onSubmit={handleAddCustomEntity} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--f-mono)', color: 'var(--t-secondary)', marginBottom: '4px' }}>
                  ENTITY NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostov or White Van Plate 491-XYZ"
                  value={newEntityName}
                  onChange={e => setNewEntityName(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', background: 'var(--ink-3)',
                    border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff', fontSize: '0.84rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--f-mono)', color: 'var(--t-secondary)', marginBottom: '4px' }}>
                    TYPE
                  </label>
                  <select
                    value={newEntityType}
                    onChange={e => setNewEntityType(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', background: 'var(--ink-3)',
                      border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem'
                    }}
                  >
                    {['Person', 'Phone', 'Vehicle', 'Location', 'Organization', 'Bank Account', 'Transaction'].map(t => (
                      <option key={t} value={t} style={{ background: '#0e1420' }}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--f-mono)', color: 'var(--t-secondary)', marginBottom: '4px' }}>
                    THREAT
                  </label>
                  <select
                    value={newEntityThreat}
                    onChange={e => setNewEntityThreat(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', background: 'var(--ink-3)',
                      border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem'
                    }}
                  >
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(th => (
                      <option key={th} value={th} style={{ background: '#0e1420' }}>{th}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddEntityModal(false)}
                  style={{
                    padding: '7px 14px', background: 'transparent',
                    border: '1px solid var(--b-soft)', borderRadius: '6px', color: 'var(--t-secondary)', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '7px 16px', background: 'var(--green)',
                    border: 'none', borderRadius: '6px', color: '#06090e', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Save Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvidence && (
        <EvidenceDetailModal
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}

    </div>
  );
}
